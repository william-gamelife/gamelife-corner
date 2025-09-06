/**
 * Create aliases for the paths
 */
const aliases = (prefix = `src`) => ({
  '@auth': `${prefix}/@auth`,
  '@i18n': `${prefix}/@i18n`,
  '@fuse': `${prefix}/@fuse`,
  '@history': `${prefix}/@history`,
  '@schema': `${prefix}/@schema`,
  '@': `${prefix}`
});

export default aliases;
