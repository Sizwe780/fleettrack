import React from 'react';

// FIX 1: Assuming the purchase logic is moved to a separate API utility file 
// (or whatever correct path is used in your project).
import { purchaseModule } from '../../api/marketplace_api'; 
// If the function is exported from the NotificationCenter file as a named export, 
// you would ensure it is exported there and keep the path. 
// However, NotificationCenter should likely not contain this business logic.

// FIX 2: Added the three undefined variables to the destructured props list.
const ModuleCard = ({ module, studentId, updateCredits, updateAuditLogs }) => {

    const handlePurchase = async () => {
        // studentId, updateCredits, and updateAuditLogs are now available from props
        const result = await purchaseModule(studentId, module.id, module.credits);
        if (result.success) {
            updateCredits(result.newBalance);
            updateAuditLogs(prev => [...prev, result.auditLog]);
        }
      };
  const { name, type, badgesRequired, credits, relevanceScore } = module;

  return (
    <div className="module-card">
      <h3>{name}</h3>
      <p><strong>Type:</strong> {type}</p>
      <p><strong>Credits:</strong> {credits}</p>
      <p><strong>Relevance:</strong> {relevanceScore}%</p>
      <div className="badges-required">
        {badgesRequired.map((badge, i) => (
          <span key={i} className="badge">{badge}</span>
        ))}
      </div>
      {/* Ensure the button calls the handler */}
      <button onClick={handlePurchase} className="purchase-btn">Purchase</button>
    </div>
  );
};

export default ModuleCard;