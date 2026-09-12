import { useState } from 'react';

const EMPTY_FIELD = { name: '', type: '', description: '', required: false };

const KIND_OPTIONS = [
  ['entity', 'Сущность'],
  ['enum', 'Перечисление'],
  ['inner-class', 'Внутренний класс'],
];

export default function EntityDesignerModal({ onClose, onCreate }) {
  const [draft, setDraft] = useState({
    kind: 'entity',
    name: '',
    qualifiedName: '',
    module: '',
    description: '',
    fields: [{ ...EMPTY_FIELD }],
    values: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateField = (index, key, value) => {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field, fieldIndex) => (
        fieldIndex === index ? { ...field, [key]: value } : field
      )),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const name = draft.name.trim();
    if (!name) {
      setError('Укажите название сущности');
      return;
    }

    const fields = draft.fields
      .filter((field) => field.name.trim() || field.type.trim())
      .map((field) => ({
        name: field.name.trim(),
        type: field.type.trim(),
        description: field.description.trim(),
        required: field.required,
      }));
    if (fields.some((field) => !field.name || !field.type)) {
      setError('У каждого добавленного поля должны быть имя и тип');
      return;
    }

    const values = [...new Set(draft.values.split(/[\n,]/).map((value) => value.trim()).filter(Boolean))];
    if (draft.kind === 'enum' && values.length === 0) {
      setError('Добавьте хотя бы одно значение перечисления');
      return;
    }

    const element = {
      kind: draft.kind,
      name,
      qualifiedName: draft.qualifiedName.trim() || name,
      module: draft.module.trim(),
      description: draft.description.trim(),
      ...(draft.kind === 'enum' ? { values } : { fields }),
    };

    try {
      setIsSaving(true);
      await onCreate(element);
    } catch (saveError) {
      setError(saveError.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Добавление новой сущности">
      <form className="modal__card designer" onSubmit={submit}>
        <header>
          <div><span>USER DESIGN LAYER</span><h2>Новая сущность</h2></div>
          <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <p>Элемент сохранится в user.json и не будет затронут обновлением AI-данных.</p>

        <div className="designer__body">
          <div className="designer__grid">
            <label>
              <span>Тип</span>
              <select value={draft.kind} onChange={(event) => update('kind', event.target.value)}>
                {KIND_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Название *</span>
              <input value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="DeploymentPolicy" autoFocus />
            </label>
            <label>
              <span>Qualified name</span>
              <input value={draft.qualifiedName} onChange={(event) => update('qualifiedName', event.target.value)} placeholder="com.example.domain.DeploymentPolicy" />
            </label>
            <label>
              <span>Модуль</span>
              <input value={draft.module} onChange={(event) => update('module', event.target.value)} placeholder="domain / deployment" />
            </label>
          </div>

          <label>
            <span>Описание</span>
            <textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows="3" placeholder="Ответственность и назначение элемента" />
          </label>

          {draft.kind === 'enum' ? (
            <label>
              <span>Значения enum *</span>
              <textarea value={draft.values} onChange={(event) => update('values', event.target.value)} rows="5" placeholder={'DRAFT\nACTIVE\nARCHIVED'} />
            </label>
          ) : (
            <section className="designer__fields">
              <div className="designer__section-title">
                <span>Поля</span>
                <button type="button" onClick={() => update('fields', [...draft.fields, { ...EMPTY_FIELD }])}>+ Добавить поле</button>
              </div>
              {draft.fields.map((field, index) => (
                <div className="designer__field" key={index}>
                  <input value={field.name} onChange={(event) => updateField(index, 'name', event.target.value)} placeholder="Имя" />
                  <input value={field.type} onChange={(event) => updateField(index, 'type', event.target.value)} placeholder="Тип" />
                  <input value={field.description} onChange={(event) => updateField(index, 'description', event.target.value)} placeholder="Описание" />
                  <label className="designer__required">
                    <input type="checkbox" checked={field.required} onChange={(event) => updateField(index, 'required', event.target.checked)} />
                    <span>обяз.</span>
                  </label>
                  <button
                    type="button"
                    className="designer__remove"
                    onClick={() => update('fields', draft.fields.filter((_, fieldIndex) => fieldIndex !== index))}
                    aria-label="Удалить поле"
                  >×</button>
                </div>
              ))}
            </section>
          )}
          {error && <div className="designer__error">{error}</div>}
        </div>

        <footer>
          <button type="button" className="button" onClick={onClose}>Отмена</button>
          <button type="submit" className="button button--design" disabled={isSaving}>
            {isSaving ? 'Сохраняю…' : 'Добавить сущность'}
          </button>
        </footer>
      </form>
    </div>
  );
}
