import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      // react-hooks v5 strict rules that produce false positives for valid patterns:
      // - set-state-in-effect: flags valid initial-value sync (matchMedia, mounted flag)
      // - purity: flags Date.now/Math.random inside ref initializers and async callbacks
      // - refs: flags .current reads for stable debounced refs (not render-affecting)
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
    },
  },
];
