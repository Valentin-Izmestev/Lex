document.addEventListener('DOMContentLoaded', () => {
    const nlTrustTab = document.querySelectorAll('.trust-tab');

    if (nlTrustTab.length > 0) {

        nlTrustTab.forEach(trustTub => {
            const nlTabBtn = trustTub.querySelectorAll('.trust-tab-controller .trust-tab-btn');
            const nlTabControlBody = trustTub.querySelectorAll('.trust-section__sl-control-box .trust-tab-body');
            const nlTabBody = trustTub.querySelectorAll('.trust-section__slider-box .trust-tab-body');
            const nlTabBodyBoxInner = trustTub.querySelectorAll('.trust-tab__body-box .trust-tab-body');


            if (nlTabBtn) {
                nlTabBtn.forEach((btn, index) => {
                    btn.addEventListener('click', () => {

                        nlTabBtn.forEach(item => {
                            item.classList.remove('active');
                        });
                        nlTabBtn[index].classList.add('active');

                        if (nlTabControlBody.length > 0) {
                            nlTabControlBody.forEach(item => {
                                item.classList.remove('active');
                            });

                            nlTabControlBody[index].classList.add('active');
                        }

                        if (nlTabBody.length > 0) {
                            nlTabBody.forEach(item => {
                                item.classList.remove('active');
                            });
                            nlTabBody[index].classList.add('active');
                        }

                        if (nlTabBodyBoxInner.length > 0) {
                            nlTabBodyBoxInner.forEach(item => {
                                item.classList.remove('active');
                            });
                            nlTabBodyBoxInner[index].classList.add('active');
                        }

                    });
                });
            }
        });
    }
});