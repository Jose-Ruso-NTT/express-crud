// ========= Config =========
const API_BASE_URL = "http://localhost:3000";

class UsersApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const contentType = res.headers.get("content-type") || "";
    const hasJson = contentType.includes("application/json");
    const body = hasJson
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  }

  listUsers() {
    return this.request("/v1/users", { method: "GET" });
  }

  createUser(input) {
    return this.request("/v1/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  updateUser(id, patch) {
    return this.request(`/v1/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  deleteUser(id) {
    return this.request(`/v1/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatApiError(err) {
  const status = err?.status;
  const body = err?.body;

  if (body && typeof body === "object") {
    const title = body.error
      ? `${body.error}${status ? ` (${status})` : ""}`
      : `Error${status ? ` (${status})` : ""}`;
    const message = body.message ? String(body.message) : "Request failed";

    let issuesText = "";
    if (Array.isArray(body.issues)) {
      issuesText = body.issues
        .map((i) => {
          const path = Array.isArray(i.path) ? i.path.join(".") : "";
          const msg = i.message ? String(i.message) : "Invalid";

          return `• ${path ? `${path}: ` : ""}${msg}`;
        })
        .join("\n");
    }

    const detailsText = body.details
      ? `\n\nDetails: ${JSON.stringify(body.details, null, 2)}`
      : "";

    return `${title}\n${message}${issuesText ? `\n\n${issuesText}` : ""}${detailsText}`;
  }

  return `Error${status ? ` (${status})` : ""}: ${err?.message || "Unknown error"}`;
}

function formatDate(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

class UsersApp extends HTMLElement {
  #api = new UsersApi(API_BASE_URL);
  #state = {
    loading: false,
    users: [],
    error: "",
    creating: false,

    // Inline edit state
    editingId: null,
    editDraft: { email: "", name: "" },
    savingEdit: false,
  };

  connectedCallback() {
    this.addEventListener("click", (e) => this.onClick(e));
    this.addEventListener("input", (e) => this.onInput(e));
    this.addEventListener("submit", (e) => this.onSubmit(e));
    this.render();
    this.load();
  }

  setLoading(v) {
    this.#state.loading = v;
    this.render();
  }

  setError(message) {
    this.#state.error = message || "";
    this.render();
  }

  async load() {
    try {
      this.setError("");
      this.setLoading(true);
      const users = await this.#api.listUsers();
      this.#state.users = Array.isArray(users) ? users : [];
    } catch (e) {
      this.setError(formatApiError(e));
    } finally {
      this.setLoading(false);
    }
  }

  startEdit(id) {
    const user = this.#state.users.find((u) => u.id === id);

    if (!user) return;

    this.#state.editingId = id;
    this.#state.editDraft = { email: user.email, name: user.name };
    this.setError("");
    this.render();
  }

  cancelEdit() {
    this.#state.editingId = null;
    this.#state.editDraft = { email: "", name: "" };
    this.#state.savingEdit = false;
    this.render();
  }

  async saveEdit(id) {
    const user = this.#state.users.find((u) => u.id === id);

    if (!user) return;

    const email = this.#state.editDraft.email.trim();
    const name = this.#state.editDraft.name.trim();

    // patch minimal: solo cambios reales
    const patch = {};
    if (email && email !== user.email) patch.email = email;
    if (name && name !== user.name) patch.name = name;

    if (Object.keys(patch).length === 0) {
      this.cancelEdit();
      return;
    }

    try {
      this.#state.savingEdit = true;
      this.render();
      await this.#api.updateUser(id, patch);
      await this.load();
      this.cancelEdit();
    } catch (err) {
      this.setError(formatApiError(err));
      this.#state.savingEdit = false;
      this.render();
    }
  }

  async onCreateSubmit(form) {
    const email = form.email.value.trim();
    const name = form.name.value.trim();

    try {
      this.#state.creating = true;
      this.render();
      await this.#api.createUser({ email, name });
      form.reset();
      await this.load();
    } catch (err) {
      this.setError(formatApiError(err));
    } finally {
      this.#state.creating = false;
      this.render();
    }
  }

  async confirmDelete() {
    const dialog = this.querySelector("#confirm-delete-dialog");
    if (!(dialog instanceof HTMLDialogElement)) return false;

    // Fallback
    if (typeof dialog.showModal !== "function") {
      return confirm("¿Eliminar este usuario?");
    }

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      Array.from(dialog.querySelectorAll(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled"),
      );

    const previouslyFocused = document.activeElement;

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);

    dialog.showModal();

    // Foco inicial: primer botón
    queueMicrotask(() => {
      const items = focusables();
      if (items[0]) items[0].focus();
    });

    return await new Promise((resolve) => {
      dialog.addEventListener(
        "close",
        () => {
          dialog.removeEventListener("keydown", onKeyDown);
          if (previouslyFocused instanceof HTMLElement) {
            previouslyFocused.focus();
          }
          resolve(dialog.returnValue === "confirm");
        },
        { once: true },
      );
    });
  }

  async onDelete(id) {
    const ok = await this.confirmDelete();
    if (!ok) return;

    try {
      this.setError("");
      await this.#api.deleteUser(id);
      await this.load();
      if (this.#state.editingId === id) this.cancelEdit();
    } catch (err) {
      this.setError(formatApiError(err));
    }
  }

  onClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "reload") void this.load();
    if (action === "edit" && id) this.startEdit(id);
    if (action === "cancel-edit") this.cancelEdit();
    if (action === "save-edit" && id) void this.saveEdit(id);
    if (action === "delete" && id) void this.onDelete(id);
  }

  onInput(e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;

    const field = el.getAttribute("data-field");
    if (!field) return;

    if (field === "edit-email") this.#state.editDraft.email = el.value;
    if (field === "edit-name") this.#state.editDraft.name = el.value;
  }

  onSubmit(e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const kind = form.getAttribute("data-form");
    if (kind !== "create") return;

    e.preventDefault();
    void this.onCreateSubmit(form);
  }

  render() {
    const {
      loading,
      users,
      error,
      creating,
      editingId,
      editDraft,
      savingEdit,
    } = this.#state;

    this.innerHTML = `
      <section class="card" style="margin-bottom: 14px;">
        <div class="row" style="justify-content: space-between; align-items: center;">
          <div>
            <div class="badge">API: ${escapeHtml(API_BASE_URL || "same-origin")}</div>
            <div class="small" style="margin-top: 6px;">Endpoints: GET/POST/PATCH/DELETE /v1/users</div>
          </div>
          <div class="actions">
            <button ${loading ? "disabled" : ""} data-action="reload">Recargar</button>
          </div>
        </div>
      </section>

      ${error ? `<pre class="alert error" style="white-space: pre-wrap;">${escapeHtml(error)}</pre>` : ""}

      <section class="card" style="margin-bottom: 14px;">
        <h2 style="margin: 0 0 10px; font-size: 16px;">Crear usuario</h2>
        <form data-form="create">
          <div class="form-row">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" placeholder="user@example.com" required />
            </div>
            <div class="field">
              <label for="name">Nombre</label>
              <input id="name" name="name" type="text" placeholder="Ejemplo: Juan Pérez" required />
            </div>
            <div class="field-actions">
              <div class="spacer-label">Acción</div>
              <button class="primary" type="submit" ${creating ? "disabled" : ""}>
                ${creating ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="row" style="justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 16px;">Usuarios</h2>
          <div class="badge">${users.length} total</div>
        </div>

        ${
          loading
            ? `<p class="small" style="margin-top: 10px;">Cargando...</p>`
            : users.length === 0
              ? `<p class="small" style="margin-top: 10px;">No hay usuarios todavía.</p>`
              : `
              <div class="table-scroll">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Email</th>
                      <th>Nombre</th>
                      <th>Creado</th>
                      <th>Actualizado</th>
                      <th style="width: 260px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users
                      .map((u) => {
                        const isEditing = editingId === u.id;

                        const emailCell = isEditing
                          ? `<input class="input-small" data-field="edit-email" type="email" value="${escapeHtml(editDraft.email)}" />`
                          : `${escapeHtml(u.email)}`;

                        const nameCell = isEditing
                          ? `<input data-field="edit-name" type="text" value="${escapeHtml(editDraft.name)}" />`
                          : `${escapeHtml(u.name)}`;

                        const actions = isEditing
                          ? `
                          <div class="actions">
                            <button class="primary" data-action="save-edit" data-id="${escapeHtml(u.id)}" ${savingEdit ? "disabled" : ""}>
                              ${savingEdit ? "Guardando..." : "Guardar"}
                            </button>
                            <button data-action="cancel-edit" ${savingEdit ? "disabled" : ""}>Cancelar</button>
                          </div>
                        `
                          : `
                          <div class="actions">
                            <button data-action="edit" data-id="${escapeHtml(u.id)}">Editar</button>
                            <button class="danger" data-action="delete" data-id="${escapeHtml(u.id)}">Eliminar</button>
                          </div>
                        `;

                        return `
                        <tr>
                          <td><code>${escapeHtml(u.id)}</code></td>
                          <td>${emailCell}</td>
                          <td>${nameCell}</td>
                          <td>${escapeHtml(formatDate(u.createdAt))}</td>
                          <td>${escapeHtml(formatDate(u.updatedAt))}</td>
                          <td>${actions}</td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
                </div>
              `
        }

        <dialog id="confirm-delete-dialog">
          <form method="dialog" class="card" style="border: none; box-shadow: none; padding: 0;">
            <h3 style="margin: 0 0 8px; font-size: 16px;">Eliminar usuario</h3>
            <p class="small" style="margin: 0 0 12px;">
              ¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </p>

            <div class="actions" style="justify-content: flex-end;">
              <button value="cancel">Cancelar</button>
              <button class="danger" value="confirm">Eliminar</button>
            </div>
            </form>
        </dialog>

      </section>
    `;
  }
}

customElements.define("users-app", UsersApp);
