exports.getAdminPage = (req, res) => {
    res.render('admin', {
      title: 'Admin Panel',
      todaysOrders: 128,
      totalOrders: 15265,
      pendingOrders: 327,
      cancelledOrders: 1360,
      siteViews: 45678,
      products: [
        { id: 1, name: 'Traditional Dining Set', category: 'Dining', price: '£1,499', dateAdded: '2025-05-01', lastEdited: '2025-05-10' },
        { id: 2, name: 'Modern Sofa', category: 'Living Room', price: '£899', dateAdded: '2025-04-15', lastEdited: '2025-05-05' }
      ],
      orders: [
        { id: 101, user: 'John Doe', product: 'Modern Dining Set', status: 'Pending', datePlaced: '2025-05-10', lastEdited: '2025-05-11' },
        { id: 102, user: 'Jane Smith', product: 'Traditional Sofa', status: 'Shipped', datePlaced: '2025-05-09', lastEdited: '2025-05-10' }
      ],
      users: [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', dateRegistered: '2025-04-15', lastEdited: '2025-05-12' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', dateRegistered: '2025-04-20', lastEdited: '2025-05-10' }
      ]
    });
  };