// Email Template Editor
class EmailEditor {
    constructor() {
        this.iframe = document.getElementById('preview-frame');
        this.previewWrapper = document.getElementById('preview-wrapper');
        this.config = this.getDefaultConfig();

        this.init();
    }

    init() {
        // Setup non-iframe event listeners immediately
        this.setupImageControls();

        // Wait for iframe to load
        this.iframe.addEventListener('load', () => {
            this.setupEventListeners();
            this.loadConfig();
        });
    }

    setupImageControls() {
        // Image upload controls
        this.setupImageUpload('hero-image-upload');
        this.setupImageUpload('product-image-upload');
        this.setupImageUpload('feature-icon-1-upload');
        this.setupImageUpload('feature-icon-2-upload');
        this.setupImageUpload('feature-icon-3-upload');

        // Image generation controls
        document.querySelectorAll('button[data-image-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.imageTarget;
                const type = e.currentTarget.dataset.imageType;
                console.log('Generate button clicked:', target, type);
                this.openImageGenModal(target, type);
            });
        });

        // Image service selector
        const serviceSelect = document.getElementById('image-service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', (e) => {
                const apiKeyGroup = document.getElementById('api-key-group');
                if (e.target.value === 'dalle') {
                    apiKeyGroup.style.display = 'block';
                } else {
                    apiKeyGroup.style.display = 'none';
                }
            });
        }

        // Generate image button
        const generateBtn = document.getElementById('generate-image-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateImage());
        }
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
            },
            images: {}
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

        // Apply images
        if (config.images) {
            Object.keys(config.images).forEach(key => {
                if (config.images[key]) {
                    this.updateImage(key, config.images[key]);
                }
            });
        }
    }

    loadConfig() {
        // Apply default config on load
        this.applyConfig(this.config);
    }

    setupImageUpload(uploadId) {
        const uploadInput = document.getElementById(uploadId);
        if (!uploadInput) return;

        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                const targetId = uploadInput.dataset.imageTarget;
                this.updateImage(targetId, imageData);
            };
            reader.readAsDataURL(file);
        });
    }

    updateImage(targetId, imageData) {
        // Update preview thumbnail
        const preview = document.getElementById(`${targetId}-preview`);
        if (preview) {
            preview.innerHTML = `<img src="${imageData}" alt="Preview">`;
        }

        // Update image in iframe
        try {
            const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            let selector;

            // Map target IDs to data-editable attributes
            const imageMap = {
                'hero-image': 'hero-image',
                'product-image': 'product-image',
                'feature-icon-1': 'feature-icon-1',
                'feature-icon-2': 'feature-icon-2',
                'feature-icon-3': 'feature-icon-3'
            };

            selector = `[data-editable="${imageMap[targetId]}"]`;
            const imgElement = doc.querySelector(selector);

            if (imgElement) {
                imgElement.src = imageData;
            }

            // Store in config
            if (!this.config.images) {
                this.config.images = {};
            }
            this.config.images[targetId] = imageData;

        } catch (error) {
            console.error('Error updating image:', error);
        }
    }

    openImageGenModal(target, type) {
        console.log('Opening image gen modal for:', target, type);
        this.currentImageTarget = target;
        this.currentImageType = type;

        // Set default prompt based on type
        const promptInput = document.getElementById('image-prompt');
        const defaultPrompts = {
            'hero': 'A luxury smartwatch on a wrist, modern and elegant, professional product photography',
            'product': 'Close-up of a smartwatch device, sleek design, high quality product shot',
            'icon': 'Simple minimalist icon, flat design, modern'
        };

        if (promptInput) {
            promptInput.value = defaultPrompts[type] || '';
        }

        // Show modal
        const modal = document.getElementById('image-gen-modal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('Modal should now be visible');
        } else {
            console.error('Modal element not found!');
        }
    }

    async generateImage() {
        const prompt = document.getElementById('image-prompt').value;
        const service = document.getElementById('image-service').value;
        const statusDiv = document.getElementById('generation-status');

        if (!prompt.trim()) {
            this.showStatus('Please enter a prompt', 'error');
            return;
        }

        statusDiv.className = 'generation-status show loading';
        statusDiv.textContent = 'Generating image...';

        try {
            let imageUrl;

            switch (service) {
                case 'placeholder':
                    imageUrl = await this.generatePlaceholder();
                    break;
                case 'unsplash':
                    imageUrl = await this.generateFromUnsplash(prompt);
                    break;
                case 'dalle':
                    imageUrl = await this.generateFromDALLE(prompt);
                    break;
            }

            if (imageUrl) {
                // Convert to base64 for embedding
                const base64Image = await this.imageUrlToBase64(imageUrl);
                this.updateImage(this.currentImageTarget, base64Image);
                this.showStatus('Image generated successfully!', 'success');

                setTimeout(() => {
                    document.getElementById('image-gen-modal').style.display = 'none';
                    statusDiv.className = 'generation-status';
                }, 1500);
            }
        } catch (error) {
            console.error('Error generating image:', error);
            this.showStatus('Error generating image: ' + error.message, 'error');
        }
    }

    async generatePlaceholder() {
        // Generate a colored placeholder based on image type
        const dimensions = this.currentImageType === 'icon' ? '60x60' : '600x400';
        const colors = ['667eea', '764ba2', 'f093fb', '4facfe'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return `https://via.placeholder.com/${dimensions}/${randomColor}/ffffff?text=Generated+Image`;
    }

    async generateFromUnsplash(prompt) {
        // Use Unsplash Source API for random images based on search term
        const searchTerm = encodeURIComponent(prompt.split(' ').slice(0, 3).join(','));
        const dimensions = this.currentImageType === 'icon' ? '60x60' : '600x400';

        // Note: This uses the deprecated source.unsplash.com API
        // For production, you should use the official Unsplash API with an API key
        return `https://source.unsplash.com/${dimensions}/?${searchTerm}`;
    }

    async generateFromDALLE(prompt) {
        const apiKey = document.getElementById('openai-api-key').value;

        if (!apiKey) {
            throw new Error('Please enter your OpenAI API key');
        }

        const size = this.currentImageType === 'icon' ? '256x256' : '1024x1024';

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: size
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate image');
        }

        const data = await response.json();
        return data.data[0].url;
    }

    async imageUrlToBase64(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            // If conversion fails, return the URL directly
            return url;
        }
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('generation-status');
        statusDiv.className = `generation-status show ${type}`;
        statusDiv.textContent = message;
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EmailEditor();
});
