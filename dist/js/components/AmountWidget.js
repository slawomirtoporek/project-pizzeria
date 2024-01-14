import {settings, select} from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this; 

    thisWidget.getElements(element);

    thisWidget.initActions();

    if(thisWidget.dom.input.value){
      thisWidget.setValue(thisWidget.dom.input.value);
    } else {
      thisWidget.setValue(settings.amountWidget.defaultValue);
    }

    // console.log('AmountWidget', thisWidget);
    // console.log('constructor arguments:', element);
  }

  getElements(){
    const thisWidget = this;
  
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return value >= settings.amountWidget.defaultMin && 
    value <= settings.amountWidget.defaultMax && 
    !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value -1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;