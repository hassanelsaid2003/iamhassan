document.addEventListener('DOMContentLoaded', function() {
    // عناصر القائمة
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const closeMenu = document.querySelector('.close-menu');
    
    // التأكد من وجود العناصر
    if (!mobileMenuToggle || !nav || !closeMenu) {
        console.error('Menu elements not found');
        return;
    }
    
    // دالة لفتح القائمة
    function openMenu() {
        nav.classList.add('active');
        document.body.style.overflow = 'hidden';
        // منع التمرير في القائمة نفسها
        nav.style.overflowY = 'auto';
    }
    
    // دالة لإغلاق القائمة
    function closeMenuFunc() {
        nav.classList.remove('active');
        document.body.style.overflow = 'auto';
        nav.style.overflowY = '';
    }
    
    // فتح القائمة عند النقر على زر القائمة
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!nav.classList.contains('active')) {
            openMenu();
        }
    });
    
    // إغلاق القائمة عند النقر على زر الإغلاق
    closeMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenuFunc();
    });
    
    // إغلاق القائمة عند النقر على الروابط
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // حساب الموقع مع مراعاة ارتفاع الهيدر
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                // إغلاق القائمة أولاً
                closeMenuFunc();
                
                // الانتقال السلس إلى القسم بعد إغلاق القائمة
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 300); // انتظر حتى تنتهي animation الإغلاق
            }
        });
    });
    
    // إغلاق القائمة عند النقر خارجها (للأجهزة غير اللمسية)
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !mobileMenuToggle.contains(e.target)) {
            closeMenuFunc();
        }
    });
    
    // معالجة خاصة للأجهزة اللمسية
    let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // إغلاق القائمة عند لمس الشاشة خارجها
        document.addEventListener('touchstart', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                closeMenuFunc();
            }
        });
        
        // دعم السحب للقائمة
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50; // المسافة المطلوبة للسحب
            
            if (touchEndX < touchStartX - swipeThreshold) {
                // السحب لليسار - إغلاق القائمة
                if (nav.classList.contains('active')) {
                    closeMenuFunc();
                }
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // السحب لليمين - فتح القائمة
                if (!nav.classList.contains('active')) {
                    openMenu();
                }
            }
        }
    }
    
    // Portfolio filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const subject = contactForm.querySelector('input[type="text"]:nth-of-type(2)').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Simple validation
            if (name && email && message) {
                // Show success message
                alert('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }
    
    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // إصلاح مشكلة التمرير في القائمة على الأجهزة اللمسية
    nav.addEventListener('touchmove', function(e) {
        if (nav.classList.contains('active')) {
            // السماح بالتمرير داخل القائمة
            const scrollTop = nav.scrollTop;
            const scrollHeight = nav.scrollHeight;
            const height = nav.clientHeight;
            const isTop = scrollTop <= 0;
            const isBottom = scrollTop + height >= scrollHeight;
            
            if ((isTop && e.deltaY < 0) || (isBottom && e.deltaY > 0)) {
                e.preventDefault();
            }
        }
    }, { passive: false });
});