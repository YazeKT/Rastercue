require("dotenv").config();
const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }
  if (!process.env.APPLEID || !process.env.APPLEIDPASS || !process.env.TEAMID) {
    console.warn('Rastercue build is not notarised: Apple signing/notarisation credentials were not supplied.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: "io.github.yazekt.rastercue",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.TEAMID,
  });
};
