// governance/NamingEnforcer.tsx
export const enforcePascalCase = (name: string) => {
    const isPascal = /^[A-Z][a-zA-Z0-9]*$/.test(name);
    if (!isPascal) {
      throw new Error(`Naming violation: ${name} is not PascalCase`);
    }
    return true;
  };