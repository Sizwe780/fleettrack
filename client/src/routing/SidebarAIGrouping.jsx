// src/components/layout/SidebarAIGrouping.jsx
import React from 'react';

export default function SidebarAIGrouping({ options }) {
  const grouped = options.reduce((acc, opt) => {
    const group = opt.category || 'General';
    acc[group] = acc[group] || [];
    acc[group].push(opt);
    return acc;
  }, {});

  return (
    <aside className="sidebar">
      {Object.entries(grouped).map(([group, items]) => (
        <section key={group}>
          <h4>{group}</h4>
          <ul>
            {items.map((item, i) => <li key={i}>{item.label}</li>)}
          </ul>
        </section>
      ))}
    </aside>
  );
}