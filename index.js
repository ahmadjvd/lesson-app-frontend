
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

});