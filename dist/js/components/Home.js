import { select, templates } from "../settings.js";
import utils from "../utils.js";

class Home{
  constructor(page){
    const thisHome = this;

    thisHome.getElements();
    thisHome.render(page);
    // thisHome.initWidgets();
  }

  getElements(){
    const thisHome = this;

    thisHome.dom = {};

    thisHome.dom.carousel = document.querySelector(select.carousel.wrapper);
  }

  render(){
    const thisHome = this;

    const generatedHTML = templates.mainPage()
    
    thisHome.element = utils.createDOMFromHTML(generatedHTML);

    const container = document.querySelector(select.containerOf.home);

    container.appendChild(thisHome.element);
  }

}

export default Home;