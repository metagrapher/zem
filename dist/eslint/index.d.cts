import * as eslint from 'eslint';

declare const rules: {
    'leading-commas': eslint.Rule.RuleModule;
    'no-loops': eslint.Rule.RuleModule;
    'no-throw': eslint.Rule.RuleModule;
    'no-any': eslint.Rule.RuleModule;
};
declare const plugin: {
    rules: {
        'leading-commas': eslint.Rule.RuleModule;
        'no-loops': eslint.Rule.RuleModule;
        'no-throw': eslint.Rule.RuleModule;
        'no-any': eslint.Rule.RuleModule;
    };
};
declare const configs: {
    recommended: {
        plugins: {
            '@metagrapher/zem': {
                rules: {
                    'leading-commas': eslint.Rule.RuleModule;
                    'no-loops': eslint.Rule.RuleModule;
                    'no-throw': eslint.Rule.RuleModule;
                    'no-any': eslint.Rule.RuleModule;
                };
            };
        };
        rules: {
            '@metagrapher/zem/leading-commas': string;
            '@metagrapher/zem/no-loops': string;
            '@metagrapher/zem/no-throw': string;
            '@metagrapher/zem/no-any': string;
        };
    };
};

export { configs, plugin as default, rules };
