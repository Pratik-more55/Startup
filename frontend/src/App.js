import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5000";

const PRODUCTS = [
  {
    id: 1,
    name: "Classic Alu Paratha",
    price: 40,
    img: "https://tse1.mm.bing.net/th/id/OIP.b9DlnRDaSgmfEEfGCZzmjgHaE9?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 2,
    name: "Butter Alu Paratha",
    price: 50,
    img: "https://www.nithyas-kitchen.com/wp-content/uploads/2015/08/alu-paratha.1024x1024.jpg",
  },
  {
    id: 3,
    name: "Cheese Alu Paratha",
    price: 70,
    img: "https://tse1.mm.bing.net/th/id/OIP.oKYIRtifp6lzbys0ShyopQHaEK?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 4,
    name: "Sandwich",
    price: 100,
    img: "https://whimsyandspice.com/wp-content/uploads/2022/09/33-Delicious-Sandwich-Recipes-to-Devour.jpg",
  },
];

export default function App() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 🔍 Backend health check
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/health`)
      .then(() => {
        setBackendOnline(true);
        toast.success("Backend Connected");
      })
      .catch(() => {
        setBackendOnline(false);
        toast.error("Backend Offline");
      });
  }, []);

  // 🛒 Cart logic
  const addToCart = (p) => {
    const found = cart.find((i) => i.id === p.id);
    if (found) {
      setCart(cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const increase = (id) =>
    setCart(cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));

  const decrease = (id) =>
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // 📦 Place order
  const placeOrder = async () => {
  try {
    await axios.post(`${API_BASE_URL}/api/orders`, {
      items: cart,
      total,
    });
    toast.success("Order placed successfully 🥳");
    setCart([]);
  } catch (err) {
    toast.error("Order failed ❌");
  }
  };


  // 🔐 Admin login
  const adminLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        username: "admin",
        password: "admin123",
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      toast.success("Admin Login Successful");
    } catch {
      toast.error("Invalid Admin Credentials");
    }
  };

  // 📊 Fetch orders (protected)
  const fetchOrders = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/orders",
      {
        headers: {
          Authorization: token,
        },
      }
    );
    setOrders(res.data);
  } catch (err) {
    console.error(err.response?.data);
    toast.error("Unauthorized – Login again");
    localStorage.removeItem("token");
    setToken(null);
  }
  };
  const updateStatus = async (id, status) => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/orders/${id}`,
      { status },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    toast.success("Order status updated");
    fetchOrders();
  } catch (err) {
    toast.error("Failed to update order");
  }
  };


  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <span className="logo">🥔</span>
          <span className="brand">Alu Paratha Kitchen</span>
        </div>
        <div className="nav-center">
          <a href="#menu">Menu</a>
          <a href="#cart">Cart</a>
          <a href="#admin">Admin</a>
        </div>
        <div className="nav-right">
          🛒 {cart.reduce((sum, i) => sum + i.qty, 0)}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>Fresh & Homemade <span>Alu Parathas</span></h1>
          <p>Hot, crispy & hygienic parathas made with love</p>
          <a href="#menu" className="hero-btn">Order Now</a>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec" alt="Paratha" />
        </div>
      </section>

      <div className="container">
        {!backendOnline && <p className="error">Backend Offline ❌</p>}

        <h2 id="menu">Menu</h2>
        <div className="grid">
          {PRODUCTS.map((p) => (
            <div className="card" key={p.id}>
              <img src={p.img} alt={p.name} />
              <h3>{p.name}</h3>
              <p>₹{p.price}</p>
              <button onClick={() => addToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>

        <h2 id="cart">Cart</h2>
        {cart.map((i) => (
          <div key={i.id} className="cart-item">
            {i.name} × {i.qty}
            <button onClick={() => increase(i.id)}>+</button>
            <button onClick={() => decrease(i.id)}>-</button>
          </div>
        ))}
        <h3>Total: ₹{total}</h3>
        <button disabled={!cart.length} onClick={placeOrder}>Place Order</button>

        <h2 id="admin">Admin Panel</h2>
        {!token ? (
          <button onClick={adminLogin}>Login as Admin</button>
        ) : (
          <>
            <button onClick={fetchOrders}>Load Orders</button>
            {orders.map((o) => (
              <div key={o._id} className="order">
                ₹{o.total} | {o.status}
                <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  <option>Pending</option>
                  <option>Cooking</option>
                  <option>Delivered</option>
                </select>
              </div>
            ))}
          </>
        )}
      </div>

      <footer className="footer">© 2025 Alu Paratha Cloud Kitchen</footer>
    </>
  );
}