const { St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { ButtonIndicator, IndicatorToStatus } = Me.imports.src.indicators.index;
const { IndicatorHandler } = Me.imports.src.indicators.handler;

const INDICATOR_DEFAULT_NAME = 'no-name-';


var IndicatorManager = class {
    constructor() {
        this.indicators = {};
        this.compatibilityNumber = 0;

        this.resolveIndicators();
    }

    resolveElement(child) {
        if (child instanceof St.BoxLayout) {
            return new ButtonIndicator(child);
        }

        while (child) {
            if (child instanceof PanelMenu.SystemIndicator 
                || child instanceof PanelMenu.Button 
                || child instanceof St.BoxLayout) {
                return child;
            }
    
            child = child.get_child_at_index ? child.get_child_at_index(0) : null;
        }
    }

    resolveIndicators() {
        // const menu = Main.panel.statusArea.aggregateMenu;
        // const menuKeys = Object.keys(menu);
        // for (const index in menuKeys) {
        //     const key = menuKeys[index];
        //     const [, name] = key.match(/^_([a-zA-Z]*)$/) || [];
        //     if (!name) continue;

        //     const child = menu[key];
        //     let indicator = this.resolveElement(child);
        //     if (!indicator) continue;

        //     this.setIndicator(name, indicator);
        // }
        
        for (const key in Main.panel.statusArea) {
            this.setIndicator(key, Main.panel.statusArea[key]);
        }

        const boxes = Main.panel.get_children();
        // boxes.push(menu._indicators);

        for (const key in boxes) {
            const box = boxes[key];
            const children = box.get_children();

            for (const subKey in children) {
                const child = children[subKey];
                let indicator = this.resolveElement(child);
                if (!indicator) continue;

                this.addIndicator(indicator);
            }
        }
    }

    hasElement(element) {
        for (const key in this.indicators) {
            const indicator = this.indicators[key];

            if (indicator.hasElement(element)) {
                return true;
            }
        }

        return false;
    }

    findIndicator(element) {
        for (const key in this.indicators) {
            const indicator = this.indicators[key];

            if (indicator.hasElement(element)) {
                return indicator;
            }
        }
    }

    hasIndicator(name) {
        return Object.keys(this.indicators).includes(name);
    }

    getIndicator(name) {
        return this.indicators[name];
    }

    setIndicator(name, element) {
        if (this.hasElement(element)) return;

        if (this.hasIndicator(name)) {
            this.getIndicator(name).setElement(element);
        }

        this.indicators[name] = new IndicatorHandler(name);
        this.indicators[name].setElement(element);
    }

    addIndicator(element) {
        if (this.hasElement(element)) return;

        const name = INDICATOR_DEFAULT_NAME + (this.compatibilityNumber++);
        const indicator = new IndicatorHandler(name);
        indicator.setElement(element);

        this.indicators[name] = indicator;
    }
};