import {templates, select, classNames} from "../settings.js";
import utils from '../utils.js';
import AmountWidget from "./AmountWidget.js";

class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.dom = {};
    //console.log('dom', thisProduct.dom);

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProduct();

    //console.log('new Product', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;
    const genratedHTML = templates.menuProduct(thisProduct.data);
    // console.log('generatedHTML', genratedHTML);
    /* generate HTML based on template */
    thisProduct.element = utils.createDOMFromHTML(genratedHTML);
    // console.log('element', thisProduct.element);
    /* create element using utils.createElementFromHTML */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* find menu container */
    menuContainer.appendChild(thisProduct.element);
    /* add element to menu */
    //console.log(menuContainer);
  }

  getElements(){
    const thisProduct = this;
  
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log('click', clickableTrigger);
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      //console.log('active', activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct != thisProduct.element){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm');
    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
  
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    //console.log('formData', formData);
  
    // set price to default price
    let price = thisProduct.data.price;
  
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);
  
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);
        
        const activeImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is not default
          if(!option.default) {
            // add option price to price variable
            price += option.price;
            //console.log('price', price);
          }
          if(activeImage) {
            activeImage.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          // check if the option is default
          if(option.default) {
            // reduce price variable
            price -= option.price;
            //console.log('price', price);
          }
          if(activeImage) {
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }   
    // price for one item
    thisProduct.priceSingle = price;
    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
    //console.log(thisProduct.dom.priceElem.innerHTML);
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

    thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    }
    );
    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {};
    
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.priceSingle * productSummary.amount;

    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const params = {};
  
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {label: param.label, options: {}};
      // for every option in this category
      for(let optionId in param.options) {
        const option = param.options[optionId];
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }   
}

export default Product;