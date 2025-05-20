const greatShadow = document.querySelector('.great-shadow');
const nlModalOpenBtn = document.querySelectorAll('[data-modal-id]');
const nlModals = document.querySelectorAll('.modal');
const nlCloseModal = document.querySelectorAll('.close-modal');

function openModal(modalID) {
    if (!greatShadow) return;
    let modal = document.querySelector('#' + modalID);
    if (modalID) {
        greatShadow.classList.add('open');
        setTimeout(function () {
            modal.classList.add('open');
        }, 200);
    }
}

function closeAllModal() {
    nlModals.forEach(modal => {
        modal.classList.remove('open');
    });
    setTimeout(function () {
        greatShadow.classList.remove('open');
    }, 200)
}

function goToModal(id) {
    closeAllModal();
    setTimeout(function () {
        openModal(id);
    }, 300);
}

if (nlModalOpenBtn.length > 0) {
    nlModalOpenBtn.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(item.getAttribute('data-modal-id'));
        });
    });
}
if (nlCloseModal.length > 0) {
    nlCloseModal.forEach(cm => {
        cm.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModal();
        })
    })
}

greatShadow.addEventListener('click', function (e) {
    if (e.target.classList.contains('great-shadow')) {
        closeAllModal();
    }
})


// работа таба в модалке регистрации
const nlmodalMab = document.querySelectorAll('.modal-tab');

if (nlmodalMab.length > 0) {
    nlmodalMab.forEach(mt => {
        let nlTabBtn = mt.querySelectorAll('.modal-tab-control__btn');
        let nlDisplay = mt.querySelectorAll('.modal-tab-display');

        if (nlTabBtn.length > 0) {

            nlTabBtn.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    nlTabBtn.forEach(item => {
                        item.classList.remove('active');
                    });
                    btn.classList.add('active');

                    nlDisplay.forEach(display => {
                        display.classList.remove('active');
                    });
                    nlDisplay[index].classList.add('active');
                });
            })
        }

    });
}



if (nlModals.length > 0) {
    nlModals.forEach(modal => {
        // Переключение шагов модалки 
        const nlModalStepBtn = modal.querySelectorAll('[data-modal-step-id]');
        const nlModalSteps = modal.querySelectorAll('.modal-step');
        if (nlModalStepBtn.length > 0) {
            nlModalStepBtn.forEach(mStepBtn => {
                mStepBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // console.log(mStepBtn.getAttribute('data-modal-step-id'))
                    let curretnModalStep = modal.querySelector('#' + mStepBtn.getAttribute('data-modal-step-id'));
                    // console.log(curretnModalStep)
                    if (!curretnModalStep) return;
                    nlModalSteps.forEach(ms => {
                        ms.classList.remove('active');
                    });
                    curretnModalStep.classList.add('active');
                });
            });
        }
       
    });
}
//  // переходы по модалкам
//     const nlGoToModalBtn = document.querySelectorAll('[data-go-to-modal');
//     if(nlGoToModalBtn.length > 0){
//         nlGoToModalBtn.forEach(gtBtn => {
//             gtBtn.addEventListener('click', (e) => {
//                 e.preventDefault();

//             })
//         })
//     }


// активация кнопок в форме в случае заполнения всех обяхательных полей (ВАЛИДАЦИЯ)
const nlModalForm = document.querySelectorAll('.modal-form');
if (nlModalForm.length > 0) {
    nlModalForm.forEach(mf => {

        let submitBtn = mf.querySelector('.btn[type="submit"]');
        // console.log(submitBtn)
        let nlReauiredField = mf.querySelectorAll('input[required="required"]');
        if (nlReauiredField.length > 0) {
            nlReauiredField.forEach(inp => {
                let fullnessFlag; //флаг заполненности полей
                inp.addEventListener('input', (e) => {
                    fullnessFlag = true;
                    nlReauiredField.forEach(item => {
                        if (!item.value || item.value.length < 3) {
                            fullnessFlag = false;
                        }
                    });
                    if (fullnessFlag) {
                        submitBtn.removeAttribute('disabled')
                    } else {
                        submitBtn.setAttribute('disabled', 'disabled')
                    }
                });
            });
        }
    });
}
