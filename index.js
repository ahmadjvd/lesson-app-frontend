 let app = new Vue({
    el: '#app',
    data: {
      lessons: [],
      sortAttribute: 'subject',
      sortOrder: 'asc',
      cart: [],
      currentPage: 'lesson',
      name: '',
      phone: '',
      phonePrefix: '050',
      phoneDigits: '',
      phoneError: '',
      orderConfirmed: false,
      searchQuery: '',
      isFormValid: false
    },

    created() {
      this.fetchLessons();
    },

    computed: {
      sortedLessons() {
        return this.lessons.slice().sort((a, b) => {
          if (typeof a[this.sortAttribute] === 'string') {
            return this.sortOrder === 'asc'
              ? a[this.sortAttribute].localeCompare(b[this.sortAttribute])
              : b[this.sortAttribute].localeCompare(a[this.sortAttribute]);
          } else {
            return this.sortOrder === 'asc'
              ? a[this.sortAttribute] - b[this.sortAttribute]
              : b[this.sortAttribute] - a[this.sortAttribute];
          }
        });
      },

      totalPrice() {
        return this.cart.reduce((total, lesson) => total + (lesson.price * lesson.quantity), 0);
      }
    },

    methods: {
      fetchLessons() {
        fetch("https://lesson-app-backend-5pwp.onrender.com/collection/products")
          .then(response => response.json())
          .then(data => {
            this.lessons = data;
          })
          .catch(error => console.log("Error fetching products:", error));
      },

      searchLessons() {
        // If search query is empty, fetch all lessons
        if (this.searchQuery.trim() === "") {
          return this.fetchLessons();
        }

        // Call backend search endpoint
        fetch(`https://lesson-app-backend-5pwp.onrender.com/search?query=${encodeURIComponent(this.searchQuery)}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            this.lessons = data;
            console.log(`Found ${data.length} results for "${this.searchQuery}"`);
          })
          .catch(error => {
            console.error("Search error:", error);
            alert("Search failed. Please try again.");
          });
      },

      addToCart(lesson) {
        const existingLesson = this.cart.find(item => item.id === lesson.id);
        if (existingLesson) {
          existingLesson.quantity++;
        } else {
          this.cart.push({ ...lesson, quantity: 1 });
        }
        lesson.Spaces--;
      },

      validateInput() {
        const userNamePattern = /^[a-zA-Z\s]+$/;

        // phoneDigits must be ONLY digits
        const onlyDigits = /^\d*$/.test(this.phoneDigits);

        // Reset error first
        this.phoneError = '';

        if (!onlyDigits) {
          this.phoneError = 'Phone number must contain digits only';
        } else if (this.phoneDigits.length > 0 && this.phoneDigits.length < 7) {
          // User started typing but not completed 7 digits
          this.phoneError = 'Invalid number: must be 7 digits';
        }

        const isPhoneValid = onlyDigits && this.phoneDigits.length === 7;

        // If phone valid, build full phone number like "0501234567"
        if (isPhoneValid) {
          this.phone = this.phonePrefix + this.phoneDigits;
        } else {
          this.phone = '';
        }

        // Checkout enabled only when:
        // 1) Name is valid
        // 2) Phone has exactly 7 digits + valid prefix
        // 3) No phone error
        this.isFormValid =
          userNamePattern.test(this.name) &&
          isPhoneValid &&
          !this.phoneError;
      },

      removeFromCart(cartItem) {
        if (cartItem.quantity > 1) {
          cartItem.quantity--;
        } else {
          const index = this.cart.indexOf(cartItem);
          if (index > -1) {
            this.cart.splice(index, 1);
          }
        }
        const lesson = this.lessons.find(item => item.id === cartItem.id);
        if (lesson) lesson.Spaces++;
      },

      togglePage() {
        this.currentPage = this.currentPage === 'lesson' ? 'cart' : 'lesson';
      },

      sortLessons() {
        // Sorting is handled by computed property sortedLessons
      },

      checkout() {
        const orderData = {
          name: this.name,
          phone: this.phone,
          cart: this.cart,
        };

        fetch('https://lesson-app-backend-5pwp.onrender.com/placeorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        })
        .then(response => response.json())
        .then(data => {
          if (data.msg === 'Order placed successfully') {
            
            // Update spaces in backend
            fetch('https://lesson-app-backend-5pwp.onrender.com/update-Spaces', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ cart: this.cart })
            })
            .then(response => response.json())
            .then(data => {
              console.log(data.msg);
            })
            .catch(error => {
              console.error('Error updating product availability:', error);
            });

            // Clear cart and show confirmation
            this.cart = [];
            this.orderConfirmed = true;
            this.name = '';
            this.phone = '';
            this.isFormValid = false;

            // Hide confirmation after 3 seconds
            setTimeout(() => {
              this.orderConfirmed = false;
            }, 3000);

          } else {
            alert('There was an issue placing your order.');
          }
        })
        .catch(error => {
          console.error('Error placing order:', error);
          alert('Failed to place order. Please try again.');
        });
      },

      getIconForSubject(subject) {
        return '';
      }
    }
  });