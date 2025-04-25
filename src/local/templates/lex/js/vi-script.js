

document.addEventListener('DOMContentLoaded', function () {

  // подключаю маску
  const maskTel = document.querySelectorAll('.mask-tel');
  if (maskTel.length > 0) {
    maskTel.forEach(mt => {
      let tMask = IMask(mt, {
        mask: '+{7}(000)000-00-00'
      });
    });
  }


  // Код ниже следит за отсутпами предпоследнего блока с классом penultimate-section и  блока с формой заявки на консультацию
  const consultationRequest = document.querySelector('.consultation-request');
  const penultimateSection = document.querySelector('.penultimate-section');
  const consultationRequestSection = document.querySelector('.consultation-request-section');
  function penultimateSectionSizeController() {
    if (consultationRequest && penultimateSection && consultationRequestSection) {
      let currentSize = consultationRequest.offsetHeight / 2;
      consultationRequestSection.style.height = currentSize + 'px';
      penultimateSection.style.paddingBottom = currentSize + 'px';
    }
  }
  penultimateSectionSizeController();
  window.addEventListener('resize', () => {
    penultimateSectionSizeController();
  });

  // подключаю слайдеры
  // our-team
  const ourTeamSlider = document.querySelector('.our-team-slider')
  var swipeOourTeamSlider = new Swiper(ourTeamSlider, {
    slidesPerView: 5,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: '.our-team-slider-btn-box .arrow-btn--right',
      prevEl: '.our-team-slider-btn-box .arrow-btn--left',
    },
    breakpoints: {
      // when window width is >= 320px
      300: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      570: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      840: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      1135: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
      5000: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
    }
  });

  const ourArticlesSlider = document.querySelector('.news-slider')
  var swipeourArticlesSlider = new Swiper(ourArticlesSlider, {
    slidesPerView: 5,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: '.news-slider-controller .arrow-btn--right',
      prevEl: '.news-slider-controller .arrow-btn--left',
    },
    breakpoints: {
      // when window width is >= 320px
      200: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      600: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      940: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      999: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
      1150: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
      5000: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
    }
  });

  const nlFeedbackSlider = document.querySelectorAll('.feedback-slider');
  if(nlFeedbackSlider.length > 0){
    nlFeedbackSlider.forEach(item => {
      var swipeFeedbackSlider = new Swiper(item, {
        slidesPerView: 3,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.feedback-slider-controller .arrow-btn--right',
          prevEl: '.feedback-slider-controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1100: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }
      });
    })
  }
  
  const nlFCasesSlider = document.querySelectorAll('.cases-slider');
  if(nlFCasesSlider.length > 0){
    nlFCasesSlider.forEach(item => {
      var swipeFeedbackSlider = new Swiper(item, {
        slidesPerView: 2,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.cases-slider-controller .arrow-btn--right',
          prevEl: '.cases-slider-controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          700: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
        }
      });
    })
  }


  const nlFeedbackSocSlider = document.querySelectorAll('.social-feedback-slider');
  if(nlFeedbackSocSlider.length > 0){
    nlFeedbackSocSlider.forEach(item => {
      var swipefeedbackSocSlider = new Swiper(item, {
        slidesPerView: 6,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.soc-feedback-slider-controller .arrow-btn--right',
          prevEl: '.soc-feedback-slider-controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          400: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          600: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          750: {
            slidesPerView: 5,
            spaceBetween: 10,
          },
          999: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
        }
      });
    });
  }


  const nlGalleryrSlider = document.querySelectorAll('.gallery-slider');
 
  if (nlGalleryrSlider.length > 0) {
    nlGalleryrSlider.forEach(item => {
      var swiperGalleryrSlider = new Swiper(item, {
        // slidesPerView: 5,
        // spaceBetween: 20,
        // slidesPerView: "auto",
        centeredSlides: true, 
        loop: true,
        // roundLengths: true,
        navigation: {
          nextEl: '.gallery-slider-controller .arrow-btn--right',
          prevEl: '.gallery-slider-controller .arrow-btn--left',
        },
        breakpoints: { 
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          580: {
            slidesPerView: 3,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          700: {
            slidesPerView: 3,
            spaceBetween: 20,
            centeredSlides: true, 
          },
          999: {
            slidesPerView: 4,
            spaceBetween: 20,
            centeredSlides: true, 
          }, 
          1470: {
            slidesPerView: 4,
            spaceBetween: 20, 
          }, 
          5000: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },
        }
      });
    });
  }

  const nlCertificatesSlider = document.querySelectorAll('.certificates-slider');
 
  if (nlCertificatesSlider.length > 0) {
    nlCertificatesSlider.forEach(item => {
      var swiperCertificatesSlider = new Swiper(item, {
        // slidesPerView: 5,
        // spaceBetween: 20,
        // slidesPerView: "auto",
        centeredSlides: true, 
        loop: true,
        // roundLengths: true,
        navigation: {
          nextEl: '.certificates-slider-controller .arrow-btn--right',
          prevEl: '.certificates-slider-controller .arrow-btn--left',
        },
        breakpoints: { 
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          580: {
            slidesPerView: 3,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          700: {
            slidesPerView: 3,
            spaceBetween: 20,
            centeredSlides: true, 
          },
          999: {
            slidesPerView: 4,
            spaceBetween: 20,
            centeredSlides: true, 
          }, 
          1470: {
            slidesPerView: 4,
            spaceBetween: 20, 
          }, 
          5000: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },
        }
      });
    });
  }


  const nlPublicationSlider = document.querySelectorAll('.publications-slider');
 
  if (nlPublicationSlider.length > 0) {
    nlPublicationSlider.forEach(item => {
      var swiperPublicationSlider = new Swiper(item, {
        slidesPerView: 5,
        spaceBetween: 20,
        // slidesPerView: "auto",
        // centeredSlides: true, 
        loop: true,
        // roundLengths: true,
        navigation: {
          nextEl: '.publications-slider-controller .arrow-btn--right',
          prevEl: '.publications-slider-controller .arrow-btn--left',
        },
        breakpoints: { 
          300: {
            slidesPerView: 2,
            spaceBetween: 10, 
          },
          580: {
            slidesPerView: 2,
            spaceBetween: 20, 
          },
          780: {
            slidesPerView: 3,
            spaceBetween: 20, 
          },
          1100: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },  
          5000: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },
        }
      });
    });
  }


  const nlFeedbackLetterSlider = document.querySelectorAll('.feedback-letter-slider')
  if (nlFeedbackLetterSlider.length > 0) {
    nlFeedbackLetterSlider.forEach(item => {
      var swipefeedbackSocSlider = new Swiper(item, {
        slidesPerView: 5,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.feedback-letter-slider--controller .arrow-btn--right',
          prevEl: '.feedback-letter-slider--controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px 
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          650: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          999: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1350: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
        }
      });
    });
  }


  const muvieSliderUp = document.querySelector('.swiper-muvie--up');
 
  if (muvieSliderUp) {
    var swipermuvieSliderUp = new Swiper(muvieSliderUp, {  
      loop: true,
      // roundLengths: true, 
      slidesPerView: 5,
      spaceBetween: 20,
      speed: 10000,
      loop: true, 
      autoplay: {
        delay: 0,
        //disableOnInteraction: true // или сделать так, чтобы восстанавливался autoplay после взаимодействия
      }
    });
  }

  const muvieSliderDown = document.querySelector('.swiper-muvie--down');
 
  if (muvieSliderDown) {
    var swipermuvieSliderDown = new Swiper(muvieSliderDown, {  
      loop: true,
      // roundLengths: true, 
      slidesPerView: 5,
      spaceBetween: 20,
      speed: 10000,
      loop: true, 
      autoplay: {
        reverseDirection: true,
        delay: 0,
        //disableOnInteraction: true // или сделать так, чтобы восстанавливался autoplay после взаимодействия
      }
    });
  }

  // lightgallery

  const nlLightgallery = document.querySelectorAll('.v-lightgallery');

  if (nlLightgallery.length > 0) {
    nlLightgallery.forEach(item => {
      lightGallery(item);
    })

  }

  // спойдеры
  // spoiler
    const nlSpoilerHead = document.querySelectorAll('.spoiler__head');
    if(nlSpoilerHead.length > 0){
      nlSpoilerHead.forEach(sph => {
        sph.addEventListener('click', () => {
          sph.parentElement.classList.toggle('active');
        })
      })
    }

    // работа якорных ссылок
    const nlAnchorLink = document.querySelectorAll('.anchor-link');

    if(nlAnchorLink.length > 0){
      nlAnchorLink.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          let anchorTarget = document.querySelector(anchor.getAttribute('href')); 
          anchorTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        })
      })
    }

    // работа поля для пароля
    const nlEyeBtn = document.querySelectorAll('.eye-btn');
    
    if(nlEyeBtn.length > 0){
      nlEyeBtn.forEach(eye => {
        eye.addEventListener('click', (e) => {
          const passInput = eye.previousElementSibling; 
          if(eye.classList.contains('open')){
            eye.classList.remove('open');
            passInput.setAttribute('type', 'password');
          }else{
            eye.classList.add('open');
            passInput.setAttribute('type', 'text');
          }
        })
      })
    } 

})