import { Handle, Position } from '@xyflow/react';

const KIND_LABELS = {
  entity: 'Сущность',
  enum: 'Перечисление',
  'inner-class': 'Внутренний класс',
};

export default function EntityNode({ data, selected }) {
  const element = data.element;
  const fields = element.fields || [];
  const details = element.kind === 'enum'
    ? element.values || []
    : [...fields.filter((field) => field.inherited), ...fields.filter((field) => !field.inherited)];

  return (
    <article className={`schema-node schema-node--${element.kind} ${element.origin === 'user' ? 'schema-node--draft' : ''} ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <header className="schema-node__header">
        <div>
          <span className="schema-node__kind">{KIND_LABELS[element.kind]}</span>
          <h3>{element.name}</h3>
        </div>
        <span className={`origin origin--${element.origin}`}>
          {element.origin === 'user' ? 'ПРОЕКТ' : 'AI'}
        </span>
      </header>
      {element.module && <div className="schema-node__module">{element.module}</div>}
      {element.description && <p>{element.description}</p>}
      {details.length > 0 && (
        <ul className="schema-node__details">
          {details.map((item) => (
            <li key={typeof item === 'string' ? item : item.name}>
              {typeof item === 'string' ? (
                <code>{item}</code>
              ) : (
                <>
                  <div className="schema-node__field-heading">
                    <span className="schema-node__field-name">
                      <span>{item.name}</span>
                      {item.inherited && (
                        <span className="schema-node__inherited" title={`Унаследовано из ${item.declaredIn}`}>
                          ← {item.declaredIn?.split(/[.$]/).pop() || 'базовый класс'}
                        </span>
                      )}
                    </span>
                    <code>{item.type}</code>
                  </div>
                  <small className={item.description ? '' : 'is-missing'}>
                    {item.description || 'Комментарий у поля отсутствует'}
                  </small>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <Handle type="source" position={Position.Right} />
    </article>
  );
}
