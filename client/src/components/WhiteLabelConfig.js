export const applyWhiteLabelConfig = ({ clientId, logoUrl, primaryColor, domain }) => {
    console.log(`🎨 Applying white-label config for ${clientId}`);
    return {
      theme: {
        logo: logoUrl,
        color: primaryColor,
        domain,
      },
    };
  };