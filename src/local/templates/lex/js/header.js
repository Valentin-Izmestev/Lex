document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('#header');
    const headerHeight = header.offsetHeight * 2;
    const nlMainMenuParentItemArrowBtn = document.querySelectorAll('.main-menu-item__arrow');
    const nlMainMenuParentElements = document.querySelectorAll('.main-menu-item--parent');

    function closeAllChildrenMenu(){
        if(nlMainMenuParentElements.length > 0){
            nlMainMenuParentElements.forEach(item => {
                item.classList.remove('open-children-menu');
            })
        }
    }   

    if(nlMainMenuParentItemArrowBtn.length > 0){
        nlMainMenuParentItemArrowBtn.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                let mmi = btn.closest('.main-menu-item');
                if(mmi.classList.contains('open-children-menu')){
                    mmi.classList.remove('open-children-menu')
                    header.classList.remove('open-menu');
                    closeAllChildrenMenu();
                }else{
                    closeAllChildrenMenu();
                    mmi.classList.add('open-children-menu');
                    header.classList.add('open-menu');
                }
            })
        })
    }
    // клики вне элемента
    document.body.addEventListener('click', (e) => { 

        // клики вне дочернего меню
        if(!(e.target.closest('.children-menu-wr') || e.target.classList.contains('main-menu-item__arrow'))){ 
            if(header.classList.contains('open-menu')){
                header.classList.remove('open-menu');
                closeAllChildrenMenu()
            }
        }
    });

    function mainMenuSrollController(){
        if(window.pageYOffset > headerHeight){ 
            if(!header.classList.contains('header--scroll')){ 
                header.classList.add('header--scroll');
                setTimeout(() => {
                    header.classList.add('header--scroll-show');
                }, 100)
            } 
        }else{
            header.classList.remove('header--scroll');
            header.classList.remove('header--scroll-show');
        } 
    }
    
    mainMenuSrollController()

    window.addEventListener('scroll', function(e){ 
        mainMenuSrollController()  
    })

    const burgerBtn = document.querySelector('.burger-btn');
    if(burgerBtn){
        burgerBtn.addEventListener('click', function(){
            header.classList.toggle('show-menu');
        })
    }

})
 
