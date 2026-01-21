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

        // Image edit controls
        document.querySelectorAll('button[data-edit-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.editTarget;
                console.log('Edit button clicked:', target);
                this.openImageEditor(target);
            });
        });

        // Image editor controls
        this.setupImageEditorControls();
    }

    setupImageEditorControls() {
        // Crop controls
        const startCropBtn = document.getElementById('start-crop-btn');
        const applyCropBtn = document.getElementById('apply-crop-btn');
        const cancelCropBtn = document.getElementById('cancel-crop-btn');

        if (startCropBtn) {
            startCropBtn.addEventListener('click', () => this.startCropping());
        }
        if (applyCropBtn) {
            applyCropBtn.addEventListener('click', () => this.applyCrop());
        }
        if (cancelCropBtn) {
            cancelCropBtn.addEventListener('click', () => this.cancelCrop());
        }

        // Text overlay controls
        const textSizeSlider = document.getElementById('overlay-text-size');
        const textSizeValue = document.getElementById('text-size-value');
        if (textSizeSlider && textSizeValue) {
            textSizeSlider.addEventListener('input', (e) => {
                textSizeValue.textContent = e.target.value + 'px';
                this.updateTextPreview();
            });
        }

        // Add listeners for all text controls to update preview
        const textControls = [
            'overlay-text',
            'overlay-text-font',
            'overlay-text-weight',
            'overlay-text-style',
            'overlay-text-color',
            'overlay-text-stroke'
        ];

        textControls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateTextPreview());
                element.addEventListener('change', () => this.updateTextPreview());
            }
        });

        const addTextOverlayBtn = document.getElementById('add-text-overlay-btn');
        const undoTextOverlayBtn = document.getElementById('undo-text-overlay-btn');
        const clearTextOverlaysBtn = document.getElementById('clear-text-overlays-btn');

        if (addTextOverlayBtn) {
            addTextOverlayBtn.addEventListener('click', () => this.addTextOverlay());
        }
        if (undoTextOverlayBtn) {
            undoTextOverlayBtn.addEventListener('click', () => this.undoTextOverlay());
        }
        if (clearTextOverlaysBtn) {
            clearTextOverlaysBtn.addEventListener('click', () => this.clearAllTextOverlays());
        }

        // Initialize text preview
        this.updateTextPreview();

        // Color overlay controls with real-time preview
        const opacitySlider = document.getElementById('color-overlay-opacity');
        const opacityValue = document.getElementById('opacity-value');
        const colorPicker = document.getElementById('color-overlay-color');

        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', (e) => {
                opacityValue.textContent = e.target.value + '%';
                // Update overlay in real-time
                this.updateColorOverlayPreview();
            });
        }

        if (colorPicker) {
            colorPicker.addEventListener('input', () => {
                // Update overlay in real-time when color changes
                this.updateColorOverlayPreview();
            });
        }

        const addColorOverlayBtn = document.getElementById('add-color-overlay-btn');
        const removeColorOverlayBtn = document.getElementById('remove-color-overlay-btn');
        if (addColorOverlayBtn) {
            addColorOverlayBtn.addEventListener('click', () => this.commitColorOverlay());
        }
        if (removeColorOverlayBtn) {
            removeColorOverlayBtn.addEventListener('click', () => this.removeColorOverlay());
        }

        // Reset and save
        const resetBtn = document.getElementById('reset-image-btn');
        const saveBtn = document.getElementById('save-edited-image-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetImage());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveEditedImage());
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

    // Image Editor Functions
    openImageEditor(targetId) {
        console.log('Opening image editor for:', targetId);

        // Store the current target
        this.editingImageTarget = targetId;

        // Get the current image
        let imageData;
        if (this.config.images && this.config.images[targetId]) {
            imageData = this.config.images[targetId];
        } else {
            // No image yet, show error
            alert('Please upload or generate an image first before editing.');
            return;
        }

        // Load image into canvas
        this.loadImageToCanvas(imageData);

        // Show modal
        const modal = document.getElementById('image-editor-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    loadImageToCanvas(imageData) {
        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            // Store original image
            this.originalImage = img;
            this.currentImage = img;

            // Set canvas size to image size (max 800px width)
            const maxWidth = 800;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Store working canvas state
            this.workingImageData = ctx.getImageData(0, 0, width, height);
            this.colorOverlayActive = false;

            // Initialize text overlay history
            this.textOverlayHistory = [];
            this.updateTextOverlayButtons();
        };
        img.src = imageData;
    }

    startCropping() {
        const canvas = document.getElementById('image-editor-canvas');
        canvas.classList.add('cropping');

        // Show/hide buttons
        document.getElementById('start-crop-btn').style.display = 'none';
        document.getElementById('apply-crop-btn').style.display = 'block';
        document.getElementById('cancel-crop-btn').style.display = 'block';

        // Setup crop selection
        this.cropSelection = { startX: 0, startY: 0, endX: 0, endY: 0, active: false };

        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        const getCanvasCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Account for canvas scaling
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const startDraw = (e) => {
            const coords = getCanvasCoords(e);
            this.cropSelection.startX = coords.x;
            this.cropSelection.startY = coords.y;
            this.cropSelection.endX = coords.x;
            this.cropSelection.endY = coords.y;
            this.cropSelection.active = true;
            isDrawing = true;

            console.log('Crop started at:', coords);
        };

        const draw = (e) => {
            if (!isDrawing) return;

            const coords = getCanvasCoords(e);
            this.cropSelection.endX = coords.x;
            this.cropSelection.endY = coords.y;

            // Redraw image and selection rectangle
            ctx.putImageData(this.workingImageData, 0, 0);

            // Apply color overlay preview if active
            if (this.colorOverlayPreviewActive) {
                const color = document.getElementById('color-overlay-color').value;
                const opacity = document.getElementById('color-overlay-opacity').value / 100;
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1.0;
            }

            // Calculate rectangle dimensions
            const x = Math.min(this.cropSelection.startX, this.cropSelection.endX);
            const y = Math.min(this.cropSelection.startY, this.cropSelection.endY);
            const width = Math.abs(this.cropSelection.endX - this.cropSelection.startX);
            const height = Math.abs(this.cropSelection.endY - this.cropSelection.startY);

            // Draw semi-transparent overlay over non-selected area
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            // Top
            ctx.fillRect(0, 0, canvas.width, y);
            // Bottom
            ctx.fillRect(0, y + height, canvas.width, canvas.height - (y + height));
            // Left
            ctx.fillRect(0, y, x, height);
            // Right
            ctx.fillRect(x + width, y, canvas.width - (x + width), height);

            // Draw selection rectangle
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            ctx.strokeRect(x, y, width, height);
            ctx.setLineDash([]);

            // Draw corner handles
            const handleSize = 10;
            ctx.fillStyle = '#667eea';
            // Top-left
            ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
            // Top-right
            ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
            // Bottom-left
            ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
            // Bottom-right
            ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
        };

        const stopDraw = () => {
            if (isDrawing) {
                const width = Math.abs(this.cropSelection.endX - this.cropSelection.startX);
                const height = Math.abs(this.cropSelection.endY - this.cropSelection.startY);
                console.log('Crop ended. Selection size:', width, 'x', height);
            }
            isDrawing = false;
        };

        // Remove old listeners if any
        if (this.cropMouseDown) {
            canvas.removeEventListener('mousedown', this.cropMouseDown);
            canvas.removeEventListener('mousemove', this.cropMouseMove);
            canvas.removeEventListener('mouseup', this.cropMouseUp);
            canvas.removeEventListener('mouseleave', this.cropMouseUp);
        }

        // Store listeners for removal later
        this.cropMouseDown = startDraw;
        this.cropMouseMove = draw;
        this.cropMouseUp = stopDraw;

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);
    }

    applyCrop() {
        if (!this.cropSelection || !this.cropSelection.active) {
            alert('Please select an area to crop first.');
            return;
        }

        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        // Calculate crop dimensions
        const x = Math.min(this.cropSelection.startX, this.cropSelection.endX);
        const y = Math.min(this.cropSelection.startY, this.cropSelection.endY);
        const width = Math.abs(this.cropSelection.endX - this.cropSelection.startX);
        const height = Math.abs(this.cropSelection.endY - this.cropSelection.startY);

        if (width < 10 || height < 10) {
            alert('Crop area is too small.');
            return;
        }

        // Get cropped image data
        const croppedData = ctx.getImageData(x, y, width, height);

        // Resize canvas to cropped size
        canvas.width = width;
        canvas.height = height;

        // Draw cropped image
        ctx.putImageData(croppedData, 0, 0);

        // Update working image data
        this.workingImageData = ctx.getImageData(0, 0, width, height);

        // Exit crop mode
        this.cancelCrop();
    }

    cancelCrop() {
        const canvas = document.getElementById('image-editor-canvas');
        canvas.classList.remove('cropping');

        // Remove event listeners
        if (this.cropMouseDown) {
            canvas.removeEventListener('mousedown', this.cropMouseDown);
            canvas.removeEventListener('mousemove', this.cropMouseMove);
            canvas.removeEventListener('mouseup', this.cropMouseUp);
            canvas.removeEventListener('mouseleave', this.cropMouseUp);
        }

        // Show/hide buttons
        document.getElementById('start-crop-btn').style.display = 'block';
        document.getElementById('apply-crop-btn').style.display = 'none';
        document.getElementById('cancel-crop-btn').style.display = 'none';

        // Redraw without selection
        const ctx = canvas.getContext('2d');
        ctx.putImageData(this.workingImageData, 0, 0);

        // Restore color overlay preview if it was active
        if (this.colorOverlayPreviewActive) {
            this.updateColorOverlayPreview();
        }

        this.cropSelection = null;
    }

    addTextOverlay() {
        const text = document.getElementById('overlay-text').value;
        if (!text.trim()) {
            alert('Please enter text for the overlay.');
            return;
        }

        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        // Save current state before adding text
        const beforeState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.textOverlayHistory.push(beforeState);

        // Get all text settings
        const fontSize = document.getElementById('overlay-text-size').value;
        const fontFamily = document.getElementById('overlay-text-font').value;
        const fontWeight = document.getElementById('overlay-text-weight').value;
        const fontStyle = document.getElementById('overlay-text-style').value;
        const color = document.getElementById('overlay-text-color').value;
        const strokeSetting = document.getElementById('overlay-text-stroke').value;
        const position = document.getElementById('overlay-text-position').value;

        // Set text style with font family, weight, and style
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';

        // Configure stroke/outline
        if (strokeSetting !== 'none') {
            ctx.strokeStyle = strokeSetting === 'black' ? '#000000' : '#ffffff';
            ctx.lineWidth = Math.max(2, parseInt(fontSize) / 20);
        }

        // Calculate position
        let x = canvas.width / 2;
        let y;

        switch (position) {
            case 'top':
                y = parseInt(fontSize) + 20;
                break;
            case 'center':
                y = canvas.height / 2;
                break;
            case 'bottom':
                y = canvas.height - 20;
                break;
        }

        // Draw text with stroke for visibility (if enabled)
        if (strokeSetting !== 'none') {
            ctx.strokeText(text, x, y);
        }
        ctx.fillText(text, x, y);

        // Update working image data
        this.workingImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Update button visibility
        this.updateTextOverlayButtons();

        // Clear the text input for next overlay
        document.getElementById('overlay-text').value = '';
    }

    undoTextOverlay() {
        if (this.textOverlayHistory.length === 0) {
            return;
        }

        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        // Restore the state before the last text overlay
        const previousState = this.textOverlayHistory.pop();
        ctx.putImageData(previousState, 0, 0);

        // Update working image data
        this.workingImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Update button visibility
        this.updateTextOverlayButtons();

        // Restore color overlay if it was active
        if (this.colorOverlayPreviewActive) {
            this.updateColorOverlayPreview();
        }
    }

    clearAllTextOverlays() {
        if (this.textOverlayHistory.length === 0) {
            return;
        }

        if (!confirm('Clear all text overlays? This will remove all text you\'ve added.')) {
            return;
        }

        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        // Restore the first saved state (before any text overlays)
        const firstState = this.textOverlayHistory[0];
        ctx.putImageData(firstState, 0, 0);

        // Update working image data
        this.workingImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Clear history
        this.textOverlayHistory = [];

        // Update button visibility
        this.updateTextOverlayButtons();

        // Restore color overlay if it was active
        if (this.colorOverlayPreviewActive) {
            this.updateColorOverlayPreview();
        }
    }

    updateTextOverlayButtons() {
        const undoBtn = document.getElementById('undo-text-overlay-btn');
        const clearBtn = document.getElementById('clear-text-overlays-btn');

        if (this.textOverlayHistory && this.textOverlayHistory.length > 0) {
            if (undoBtn) undoBtn.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'block';
        } else {
            if (undoBtn) undoBtn.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
        }
    }

    updateTextPreview() {
        const previewContent = document.getElementById('text-preview-content');
        if (!previewContent) return;

        // Get text
        const text = document.getElementById('overlay-text').value || 'Your text here';

        // Get font settings
        const fontSize = document.getElementById('overlay-text-size').value;
        const fontFamily = document.getElementById('overlay-text-font').value;
        const fontWeight = document.getElementById('overlay-text-weight').value;
        const fontStyle = document.getElementById('overlay-text-style').value;
        const color = document.getElementById('overlay-text-color').value;
        const strokeSetting = document.getElementById('overlay-text-stroke').value;

        // Update preview
        previewContent.textContent = text;
        previewContent.style.fontFamily = fontFamily;
        previewContent.style.fontSize = Math.min(parseInt(fontSize) / 2, 32) + 'px'; // Scale down for preview
        previewContent.style.fontWeight = fontWeight;
        previewContent.style.fontStyle = fontStyle;
        previewContent.style.color = color;

        // Apply text stroke/outline effect
        if (strokeSetting !== 'none') {
            const strokeColor = strokeSetting === 'black' ? '#000000' : '#ffffff';
            previewContent.style.textShadow = `
                -1px -1px 0 ${strokeColor},
                1px -1px 0 ${strokeColor},
                -1px 1px 0 ${strokeColor},
                1px 1px 0 ${strokeColor}
            `;
        } else {
            previewContent.style.textShadow = 'none';
        }
    }

    updateColorOverlayPreview() {
        if (!this.workingImageData) return;

        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        const color = document.getElementById('color-overlay-color').value;
        const opacity = document.getElementById('color-overlay-opacity').value / 100;

        // Restore working image first
        ctx.putImageData(this.workingImageData, 0, 0);

        // Add color overlay
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        this.colorOverlayPreviewActive = true;
    }

    commitColorOverlay() {
        // Make the overlay permanent by updating working image data
        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        this.workingImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.colorOverlayPreviewActive = false;

        alert('Color overlay applied! You can add more overlays or save your changes.');
    }

    removeColorOverlay() {
        if (!this.workingImageData) return;

        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        // Restore working image without overlay
        ctx.putImageData(this.workingImageData, 0, 0);

        this.colorOverlayPreviewActive = false;
    }

    resetImage() {
        if (!this.originalImage) return;

        if (!confirm('Reset to original image? This will remove all edits (crops, text, overlays).')) {
            return;
        }

        // Reload original image
        this.loadImageToCanvas(this.originalImage.src);
    }

    saveEditedImage() {
        const canvas = document.getElementById('image-editor-canvas');
        const ctx = canvas.getContext('2d');

        // If color overlay preview is active, apply it first
        if (this.colorOverlayPreviewActive) {
            // The overlay is already drawn on canvas, just update working data
            this.workingImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.colorOverlayPreviewActive = false;
        } else {
            // Make sure canvas shows the current working image
            ctx.putImageData(this.workingImageData, 0, 0);
        }

        // Convert canvas to data URL
        const editedImageData = canvas.toDataURL('image/png');

        // Update the image
        this.updateImage(this.editingImageTarget, editedImageData);

        // Close modal
        document.getElementById('image-editor-modal').style.display = 'none';

        alert('Image updated successfully!');
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EmailEditor();
});
