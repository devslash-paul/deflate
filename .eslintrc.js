module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb",
    "rules": {
        "eqeqeq": ["error","smart"],
        "arrow-parens": "off",
        "no-bitwise": "off",
        "no-continue": "off",
        "no-plusplus": "off",
        "react/prop-types": "off",
        "react/no-unescaped-entities": "off",
        "react/no-unused-state": "off",
    },
    "env": {
        "browser": true
    }
};