declare const rules: {
    'leading-commas': Rule.RuleModule;
    'no-loops': Rule.RuleModule;
    'no-throw': Rule.RuleModule;
    'no-any': Rule.RuleModule;
};
declare const configs: {
    recommended: {
        plugins: string[];
        rules: {
            '@metagrapher/zem/leading-commas': string;
            '@metagrapher/zem/no-loops': string;
            '@metagrapher/zem/no-throw': string;
            '@metagrapher/zem/no-any': string;
        };
    };
};
declare const plugin: {
    rules: {
        'leading-commas': Rule.RuleModule;
        'no-loops': Rule.RuleModule;
        'no-throw': Rule.RuleModule;
        'no-any': Rule.RuleModule;
    };
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                '@metagrapher/zem/leading-commas': string;
                '@metagrapher/zem/no-loops': string;
                '@metagrapher/zem/no-throw': string;
                '@metagrapher/zem/no-any': string;
            };
        };
    };
};

export { configs, plugin as default, rules };
