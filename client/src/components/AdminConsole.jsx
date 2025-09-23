// Add dropdown to change role
<select onChange={(e) => updateRole(user.uid, e.target.value)}>
  <option value="driver">Driver</option>
  <option value="admin">Admin</option>
  <option value="compliance">Compliance</option>
</select>

<ul>
  {user.auditTrail.map((entry, i) => (
    <li key={i}>
      {entry.action} by {entry.actor} @ {new Date(entry.timestamp).toLocaleString()}
    </li>
  ))}
</ul>