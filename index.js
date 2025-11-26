
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
    methods:{
          fetchLessons() {
        fetch("http://localhost:3000/collection/products")
          .then(response => response.json())
          .then(data => {
            this.lessons = data;
          })
          .catch(error => console.log("Error fetching products:", error));
      },
    }

});