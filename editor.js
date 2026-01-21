// Email Template Editor
class EmailEditor {
    constructor() {
        this.iframe = document.getElementById('preview-frame');
        this.previewWrapper = document.getElementById('preview-wrapper');
        this.config = this.getDefaultConfig();

        this.init();
    }

    init() {
        // Wait for iframe to load
        this.iframe.addEventListener('load', () => {
            this.setupEventListeners();
            this.loadConfig();
        });
    }

    getDefaultConfig() {
        return {
            colors: {
                primary: '#000000',
                secondary: '#ffffff',
                text: '#333333',
                background: '#ffffff'
            },
            fonts: {
                heading: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                body: "'Helvetica Neue', Helvetica, Arial, sans-serif"
            },
            content: {
                logoText: 'GANANCE',
                heroTitle: 'MAKE YOUR FAVORITE\nWATCH SMART',
                productName: 'Ganance Heir (Pre-Order)',
                productDescription: 'Transform any traditional watch into a smart timepiece with the Ganance Heir. Our innovative technology seamlessly integrates with your favorite watches, adding smart features without compromising their classic design.',
                ctaText: 'PRE-ORDER NOW',
                featuresTitle: 'Your Style. Our Tech.'
            },
            components: {
                header: true,
                hero: true,
                productIntro: true,
                productDetail: true,
                features: true,
                footer: true
            }
        };
    }

    setupEventListeners() {
        // Color controls
        this.setupColorControl('primary-color', '--primary-color');
        this.setupColorControl('secondary-color', '--secondary-color');
        this.setupColorControl('text-color', '--text-color');
        this.setupColorControl('background-color', '--background-color');

        // Typography controls
        document.getElementById('heading-font').addEventListener('change', (e) => {
            this.updateCSSVariable('--heading-font', e.target.value);
            this.config.fonts.heading = e.target.value;
        });

        document.getElementById('body-font').addEventListener('change', (e) => {
            this.updateCSSVariable('--body-font', e.target.value);
            this.config.fonts.body = e.target.value;
        });

        // Content controls
        this.setupContentControl('logo-text', 'logo-text');
        this.setupContentControl('hero-title', 'hero-title');
        this.setupContentControl('product-name', 'product-name');
        this.setupContentControl('product-description', 'product-description');
        this.setupContentControl('cta-text', 'cta-button');
        this.setupContentControl('features-title', 'features-title');

        // Component visibility controls
        this.setupComponentToggle('show-header', 'header');
        this.setupComponentToggle('show-hero', 'hero');
        this.setupComponentToggle('show-product-intro', 'product-intro');
        this.setupComponentToggle('show-product-detail', 'product-detail');
        this.setupComponentToggle('show-features', 'features');
        this.setupComponentToggle('show-footer', 'footer');

        // Responsive preview controls
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preview-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const width = e.target.dataset.width;
                this.previewWrapper.style.maxWidth = width;

                // Update label
                const label = e.target.textContent;
                document.getElementById('preview-size-label').textContent = `${label} View`;
            });
        });

        // Export/Import controls
        document.getElementById('export-html').addEventListener('click', () => this.exportHTML());
        document.getElementById('save-config').addEventListener('click', () => this.saveConfig());
        document.getElementById('load-config').addEventListener('click', () => {
            document.getElementById('config-file').click();
        });
        document.getElementById('config-file').addEventListener('change', (e) => this.loadConfigFile(e));
    }

    setupColorControl(inputId, cssVar) {
        const colorInput = document.getElementById(inputId);
        const textInput = document.getElementById(`${inputId}-text`);

        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            textInput.value = color;
            this.updateCSSVariable(cssVar, color);

            // Update config
            const configKey = cssVar.replace('--', '').replace('-color', '');
            this.config.colors[configKey] = color;
        });

        textInput.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                colorInput.value = color;
                this.updateCSSVariable(cssVar, color);

                // Update config
                const configKey = cssVar.replace('--', '').replace('-color', '');
                this.config.colors[configKey] = color;
            }
        });
    }

    setupContentControl(inputId, dataAttribute) {
        const input = document.getElementById(inputId);
        input.addEventListener('input', (e) => {
            this.updateContent(dataAttribute, e.target.value);

            // Update config
            const configKey = inputId.replace(/-/g, '').replace('text', 'Text');
            const camelCaseKey = configKey.charAt(0).toLowerCase() + configKey.slice(1);
            this.config.content[camelCaseKey] = e.target.value;
        });
    }

    setupComponentToggle(checkboxId, componentName) {
        const checkbox = document.getElementById(checkboxId);
        checkbox.addEventListener('change', (e) => {
            this.toggleComponent(componentName, e.target.checked);

            // Update config
            this.config.components[componentName.replace('-', '')] = e.target.checked;
        });
    }

    updateCSSVariable(variable, value) {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            doc.documentElement.style.setProperty(variable, value);
        } catch (error) {
            console.error('Error updating CSS variable:', error);
        }
    }

    updateContent(dataAttribute, value) {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            const element = doc.querySelector(`[data-editable="${dataAttribute}"]`);

            if (element) {
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    element.value = value;
                } else if (element.tagName === 'A') {
                    element.textContent = value;
                } else {
                    // Preserve line breaks for hero title
                    if (dataAttribute === 'hero-title') {
                        element.innerHTML = value.replace(/\n/g, '<br>');
                    } else {
                        element.textContent = value;
                    }
                }
            }
        } catch (error) {
            console.error('Error updating content:', error);
        }
    }

    toggleComponent(componentName, show) {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            const component = doc.querySelector(`[data-component="${componentName}"]`);

            if (component) {
                component.style.display = show ? '' : 'none';
            }
        } catch (error) {
            console.error('Error toggling component:', error);
        }
    }

    exportHTML() {
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            let html = doc.documentElement.outerHTML;

            // Convert CSS variables to inline styles for email compatibility
            html = this.convertCSSVariablesToInline(html);

            // Create download
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'email-template-customized.html';
            a.click();
            URL.revokeObjectURL(url);

            alert('HTML exported successfully!');
        } catch (error) {
            console.error('Error exporting HTML:', error);
            alert('Error exporting HTML. Please try again.');
        }
    }

    convertCSSVariablesToInline(html) {
        // Replace CSS variables with actual values in the HTML
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Update CSS variables in style tag
        const styleTag = doc.querySelector('style');
        if (styleTag) {
            let css = styleTag.textContent;
            css = css.replace(/--primary-color:\s*[^;]+;/, `--primary-color: ${this.config.colors.primary};`);
            css = css.replace(/--secondary-color:\s*[^;]+;/, `--secondary-color: ${this.config.colors.secondary};`);
            css = css.replace(/--text-color:\s*[^;]+;/, `--text-color: ${this.config.colors.text};`);
            css = css.replace(/--background-color:\s*[^;]+;/, `--background-color: ${this.config.colors.background};`);
            css = css.replace(/--heading-font:\s*[^;]+;/, `--heading-font: ${this.config.fonts.heading};`);
            css = css.replace(/--body-font:\s*[^;]+;/, `--body-font: ${this.config.fonts.body};`);
            styleTag.textContent = css;
        }

        return doc.documentElement.outerHTML;
    }

    saveConfig() {
        const configJSON = JSON.stringify(this.config, null, 2);
        const blob = new Blob([configJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email-config.json';
        a.click();
        URL.revokeObjectURL(url);

        alert('Configuration saved successfully!');
    }

    loadConfigFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                this.applyConfig(config);
                alert('Configuration loaded successfully!');
            } catch (error) {
                console.error('Error loading config:', error);
                alert('Error loading configuration file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    applyConfig(config) {
        this.config = { ...this.getDefaultConfig(), ...config };

        // Apply colors
        if (config.colors) {
            Object.keys(config.colors).forEach(key => {
                const inputId = `${key}-color`;
                const colorInput = document.getElementById(inputId);
                const textInput = document.getElementById(`${inputId}-text`);

                if (colorInput && textInput) {
                    colorInput.value = config.colors[key];
                    textInput.value = config.colors[key];
                    this.updateCSSVariable(`--${key}-color`, config.colors[key]);
                }
            });
        }

        // Apply fonts
        if (config.fonts) {
            if (config.fonts.heading) {
                document.getElementById('heading-font').value = config.fonts.heading;
                this.updateCSSVariable('--heading-font', config.fonts.heading);
            }
            if (config.fonts.body) {
                document.getElementById('body-font').value = config.fonts.body;
                this.updateCSSVariable('--body-font', config.fonts.body);
            }
        }

        // Apply content
        if (config.content) {
            const contentMap = {
                logoText: ['logo-text', 'logo-text'],
                heroTitle: ['hero-title', 'hero-title'],
                productName: ['product-name', 'product-name'],
                productDescription: ['product-description', 'product-description'],
                ctaText: ['cta-text', 'cta-button'],
                featuresTitle: ['features-title', 'features-title']
            };

            Object.keys(contentMap).forEach(key => {
                if (config.content[key]) {
                    const [inputId, dataAttribute] = contentMap[key];
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = config.content[key];
                        this.updateContent(dataAttribute, config.content[key]);
                    }
                }
            });
        }

        // Apply component visibility
        if (config.components) {
            Object.keys(config.components).forEach(key => {
                const checkboxId = `show-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    checkbox.checked = config.components[key];
                    this.toggleComponent(key.replace(/([A-Z])/g, '-$1').toLowerCase(), config.components[key]);
                }
            });
        }
    }

    loadConfig() {
        // Apply default config on load
        this.applyConfig(this.config);
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EmailEditor();
});
