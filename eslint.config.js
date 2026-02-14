import neostandard from "neostandard";

export default [
    ...neostandard({
        ts: true,
        semi: true,
        noStyle: true
    }),
    {
        rules: {
            'no-new': 'off',
        }
    }
]