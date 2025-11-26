
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
            fetch("http://localhost:3000/collection/products")
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
        fetch(`http://localhost:3000/search?query=${encodeURIComponent(this.searchQuery)}`)
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
        const userPhonePattern = /^\d{10}$/;
        this.isFormValid = userNamePattern.test(this.name) && userPhonePattern.test(this.phone);
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
    }

});