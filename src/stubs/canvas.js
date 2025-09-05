// Minimal stub so anything importing "canvas" doesn't crash on Vercel.
module.exports = new Proxy({}, {
  get() {
    // Return a no-op function/ctor for any property access
    return () => {
      throw new Error("The native 'canvas' module is not available in this runtime.");
    };
  },
});
