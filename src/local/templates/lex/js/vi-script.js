

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
  if (nlFeedbackSlider.length > 0) {
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
  if (nlFCasesSlider.length > 0) {
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
  if (nlFeedbackSocSlider.length > 0) {
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
      slidesPerView: 3,
      spaceBetween: 0,
      speed: 30000,
      loop: true,
      direction: 'vertical',
      autoplay: {
        reverseDirection: true,
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
      slidesPerView: 3,
      spaceBetween: 0,
      speed: 30000,
      loop: true,
      direction: 'vertical',
      autoplay: {
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
  if (nlSpoilerHead.length > 0) {
    nlSpoilerHead.forEach(sph => {
      sph.addEventListener('click', () => {
        sph.parentElement.classList.toggle('active');
      })
    })
  }

  // работа якорных ссылок
  const nlAnchorLink = document.querySelectorAll('.anchor-link');

  if (nlAnchorLink.length > 0) {
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

  // показать или скрыть пароль
  const nlEyeBtn = document.querySelectorAll('.eye-btn');

  if (nlEyeBtn.length > 0) {
    nlEyeBtn.forEach(eye => {
      eye.addEventListener('click', (e) => {
        const passInput = eye.previousElementSibling;
        if (eye.classList.contains('open')) {
          eye.classList.remove('open');
          passInput.setAttribute('type', 'password');
        } else {
          eye.classList.add('open');
          passInput.setAttribute('type', 'text');
        }
      })
    })
  }


  const nlTooltips = document.querySelectorAll('.tooltip');
  if (nlTooltips.length > 0) {
    nlTooltips.forEach(tooltip => {
      let tooltipTemplate = tooltip.querySelector('.tooltip-template');
      tippy(tooltip, {
        content: tooltipTemplate,
        // trigger: 'click',
        placement: "bottom",
        flipOnUpdate: true
      }
      );
    })
  }

  // ячейки копирования в буфер обмена 

  const nlCopyredCell = document.querySelectorAll('.copyred-cell');
  if (nlCopyredCell.length > 0) {
    nlCopyredCell.forEach(ccItem => {
      let copyTarget = ccItem.querySelector('.copyred-cell__target');
      let copyBtn = ccItem.querySelector('.copy-it-btn');
      if (copyBtn && copyTarget) {
        copyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(copyTarget.innerHTML)
            .then(() => {
              console.log('Скопировано')
              ccItem.classList.add('copyred-cell--success');
              setTimeout(() => {
                ccItem.classList.remove('copyred-cell--success');
              }, 1200);
            })
            .catch(error => {
              console.error(`Текст не скопирован ${error}`)
            })
        })
      }

    });
  }

  // работа таба в тарифе
  let nlRateStack = document.querySelectorAll('.rate-stack');
  if (nlRateStack.length > 0) {
    nlRateStack.forEach(rs => {
      const nlRateNavBtn = rs.querySelectorAll('.rate-nav-btn');
      const nlRate = rs.querySelectorAll('.rate');
      if (nlRateNavBtn.length > 0) {
        nlRateNavBtn.forEach(rBtn => {
          rBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (nlRate[rBtn.dataset.rateNumer - 1]) {
              nlRate.forEach(r => {
                r.classList.remove('active');
              });
              nlRate[rBtn.dataset.rateNumer - 1].classList.add('active');
            }
          });
        });
      }
    });
  }


  // подключаю селекты
  let arChoicesS = [];
  let arChoices = [];


  const ndSelect = document.querySelectorAll('.form-elem__choices');
  if (ndSelect.length > 0) {
    ndSelect.forEach(select => {

      if (select.classList.contains('form-elem__choices--search')) {
        let choicesS = new Choices(select, {
          placeholder: true,
          searchEnabled: true,
          removeItemButton: false,
          itemSelectText: '',
          noResultsText: 'Нет результатов поиска',
          noChoicesText: 'Не из чего выбирать',
          classNames: {
            listItems: 'choices__list--multiple-test',
          }
        });
        arChoicesS.push(choicesS);
      } else {
        let choices = new Choices(select, {
          placeholder: true,
          searchChoices: false,
          searchEnabled: false,
          itemSelectText: '',
          removeItemButton: false,
          noResultsText: 'Нет результатов поиска',
          noChoicesText: 'Нечего чего выбирать',
        });

        arChoices.push(choices);
      }
    })
  }
 
})