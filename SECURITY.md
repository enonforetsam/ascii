# Security

ASCII runs entirely in the visitor's browser. The Worker in `worker.js` serves static
files with security headers and never stores anything. There are no accounts, no
uploads that leave the device, and no third-party requests except Cloudflare Web
Analytics.

If you find a way to break that, email danial.alias1@gmail.com with the details. You will
get a reply within a week, and credit in the fix if you want it. Please do not open a
public issue for anything that could affect visitors before it is fixed.
