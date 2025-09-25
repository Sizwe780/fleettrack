export const storeSecureKey = ({ service, key }) => {
    const encrypted = btoa(key); // Simulated encryption
    console.log(`🔐 Key stored for ${service}: ${encrypted}`);
    return { status: 'secured', service };
  };