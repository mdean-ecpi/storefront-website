const products = [
  {id:"latte", name:"Brew Haven House Latte", price:5.50, category:"Coffee", image:"images/latte.svg", description:"Espresso with steamed milk and a light layer of foam."},
  {id:"coldbrew", name:"Cold Brew Coffee", price:4.75, category:"Coffee", image:"images/cold-brew.svg", description:"Smooth, chilled coffee with a rich flavor."},
  {id:"muffin", name:"Blueberry Muffin", price:3.25, category:"Bakery", image:"images/muffin.svg", description:"Freshly baked muffin made with blueberries."},
  {id:"beans", name:"Brew Haven Coffee Beans", price:14.00, category:"Coffee Beans", image:"images/beans.svg", description:"A packaged bag of Brew Haven coffee beans for brewing at home."},
  {id:"mug", name:"Brew Haven Travel Mug", price:18.00, category:"Merchandise", image:"images/travel-mug.svg", description:"A reusable travel mug featuring the Brew Haven brand."},
  {id:"mocha", name:"Chocolate Mocha", price:5.75, category:"Coffee", image:"images/latte.svg", description:"Espresso, steamed milk, and chocolate flavor topped with foam."},
  {id:"caramel", name:"Caramel Macchiato", price:6.00, category:"Coffee", image:"images/cold-brew.svg", description:"Espresso and creamy milk finished with caramel flavor."},
  {id:"croissant", name:"Butter Croissant", price:3.50, category:"Bakery", image:"images/muffin.svg", description:"Flaky, buttery pastry baked fresh for the morning rush."},
  {id:"icedtea", name:"Peach Iced Tea", price:4.25, category:"Cold Drinks", image:"images/cold-brew.svg", description:"Refreshing iced tea with a bright peach flavor."},
  {id:"tumbler", name:"Brew Haven Tumbler", price:22.00, category:"Merchandise", image:"images/travel-mug.svg", description:"Insulated reusable tumbler for coffee on the go."}
];

const productMap = Object.fromEntries(products.map(p => [p.id, p]));
const coupons = { BREW10: 0.10, COFFEE15: 0.15 };
function getCart(){ return JSON.parse(localStorage.getItem("brewHavenCart") || "[]"); }
function saveCart(cart){ localStorage.setItem("brewHavenCart", JSON.stringify(cart)); }
function getCoupon(){ return localStorage.getItem("brewHavenCoupon") || ""; }
function saveCoupon(code){ if(code) localStorage.setItem("brewHavenCoupon", code); else localStorage.removeItem("brewHavenCoupon"); }
function addToCart(id){
  const cart=getCart(); const item=cart.find(x=>x.id===id);
  if(item) item.qty++; else cart.push({id,qty:1});
  saveCart(cart); updateCartCount(); alert(productMap[id].name+" was added to your cart.");
}
function updateCartCount(){ const count=getCart().reduce((sum,x)=>sum+x.qty,0); document.querySelectorAll(".cart-count").forEach(el=>el.textContent=count); }
function renderProducts(){
  const grid=document.getElementById("product-grid"); if(!grid) return;
  grid.innerHTML="";
  // JavaScript looping mechanism: every product card is created from the products array.
  products.forEach(product=>{
    grid.insertAdjacentHTML("beforeend", `<article class="card"><img src="${product.image}" alt="${product.name}"><span class="category">${product.category}</span><h2>${product.name}</h2><p>${product.description}</p><p class="price">$${product.price.toFixed(2)}</p><button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button></article>`);
  });
}
function renderCart(){
  const area=document.getElementById("cart-items"); if(!area)return; const cart=getCart();
  if(!cart.length){area.innerHTML="<p>Your cart is empty. <a href='shop.html'>Shop the menu</a>.</p>"; document.getElementById("cart-total").textContent="$0.00"; return;}
  let total=0;
  area.innerHTML=cart.map((item,i)=>{const p=productMap[item.id],line=p.price*item.qty;total+=line;return `<tr><td>${p.name}</td><td>${item.qty}</td><td>$${p.price.toFixed(2)}</td><td>$${line.toFixed(2)}</td><td><button class="btn" onclick="removeItem(${i})">Remove</button></td></tr>`}).join("");
  document.getElementById("cart-total").textContent="$"+total.toFixed(2);
}
function removeItem(i){const cart=getCart();cart.splice(i,1);saveCart(cart);renderCart();updateCartCount();}
function calculateSubtotal(){return getCart().reduce((sum,x)=>sum+(productMap[x.id]?.price||0)*x.qty,0);}
function calculateDiscount(subtotal){const code=getCoupon().toUpperCase();return coupons[code]?subtotal*coupons[code]:0;}
function fillCheckout(){
  const el=document.getElementById("checkout-summary"); if(!el)return; const cart=getCart();
  el.innerHTML=cart.length?cart.map(x=>{const p=productMap[x.id];return `<li>${p.name} × ${x.qty} — $${(p.price*x.qty).toFixed(2)}</li>`}).join(""):"<li>Your cart is empty.</li>";
  updateCheckoutTotals();
}
function updateCheckoutTotals(){
  const subtotal=calculateSubtotal(), discount=calculateDiscount(subtotal), total=subtotal-discount;
  const a=document.getElementById("checkout-subtotal"),b=document.getElementById("checkout-discount"),c=document.getElementById("checkout-total");
  if(a)a.textContent="$"+subtotal.toFixed(2); if(b)b.textContent="-$"+discount.toFixed(2); if(c)c.textContent="$"+total.toFixed(2);
}
function applyCoupon(){
  const input=document.getElementById("coupon"), message=document.getElementById("coupon-message"); if(!input||!message)return;
  const code=input.value.trim().toUpperCase();
  if(coupons[code]){saveCoupon(code);message.textContent=`Coupon ${code} applied: ${coupons[code]*100}% off your order.`;message.className="form-message success";}
  else if(code){saveCoupon("");message.textContent="Coupon code not found. Try BREW10 or COFFEE15.";message.className="form-message error";}
  else{saveCoupon("");message.textContent="Enter a coupon code to apply a discount.";message.className="form-message error";}
  updateCheckoutTotals();
}
function requiredValue(id){return document.getElementById(id)?.value.trim()||"";}
function validateCheckout(){
  const requiredIds=["ship-name","ship-address","ship-city","ship-state","ship-zip","ship-phone","card-name","card-number","expiration","security"];
  const missing=requiredIds.filter(id=>!requiredValue(id));
  const errors=[];
  if(missing.length) errors.push("Please complete all required fields.");
  const zip=requiredValue("ship-zip"); if(zip&&!/^\d{5}(-\d{4})?$/.test(zip)) errors.push("ZIP Code must be 5 digits or ZIP+4.");
  const phone=requiredValue("ship-phone"); if(phone&&!/^[-+()\d\s]{10,}$/.test(phone)) errors.push("Enter a valid phone number.");
  const card=requiredValue("card-number").replace(/\s|-/g,""); if(card&&!/^\d{13,19}$/.test(card)) errors.push("Credit Card Number must contain 13–19 digits.");
  const security=requiredValue("security"); if(security&&!/^\d{3,4}$/.test(security)) errors.push("Security Code must contain 3–4 digits.");
  const state=requiredValue("ship-state"); if(state&&!/^[A-Za-z]{2}$/.test(state)) errors.push("State must be a two-letter abbreviation.");
  const expiration=requiredValue("expiration"); if(expiration&&new Date(expiration+"-01")<new Date(new Date().getFullYear(),new Date().getMonth(),1)) errors.push("Expiration Date must be current or future.");
  const box=document.getElementById("checkout-errors"); if(box)box.textContent=errors.join(" "); return errors.length===0;
}
function setupForms(){
  const checkout=document.getElementById("checkout-form");
  if(checkout) checkout.addEventListener("submit",e=>{ if(!validateCheckout()){e.preventDefault();} else {localStorage.setItem("brewHavenOrder","placed");} });
  const contact=document.getElementById("contact-form");
  if(contact) contact.addEventListener("submit",e=>{
    e.preventDefault(); const email=requiredValue("contact-email"), message=requiredValue("contact-message"), errors=[];
    if(!email)errors.push("Email Address is required."); else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.push("Enter a valid email address.");
    if(!message)errors.push("Message is required.");
    document.getElementById("contact-errors").textContent=errors.join(" ");
    document.getElementById("contact-success").textContent=errors.length?"":"Thank you! Your message has been prepared successfully for this student-project demo.";
    if(!errors.length)contact.reset();
  });
}
document.addEventListener("DOMContentLoaded",()=>{updateCartCount();renderProducts();renderCart();fillCheckout();setupForms();});

function setupNetworkTest(){
  const hostEl=document.getElementById("local-host-name");
  if(!hostEl) return;

  const portEl=document.getElementById("communication-port");
  const protocolEl=document.getElementById("transmission-protocol");
  const lastEl=document.getElementById("last-launched");
  const statusEl=document.getElementById("network-status");

  const previousLaunch=localStorage.getItem("brewHavenLastLaunch");
  const now=new Date();

  hostEl.textContent=window.location.hostname || "Not available";
  portEl.textContent=window.location.port || (window.location.protocol === "https:" ? "443 (default)" : "80 (default)");
  protocolEl.textContent=window.location.protocol.replace(":", "").toUpperCase();
  lastEl.textContent=previousLaunch ? new Date(previousLaunch).toLocaleString() : "First launch — no previous launch recorded";

  function updateNetworkStatus(){
    if(navigator.onLine){
      statusEl.textContent="Network recognized: browser reports an active network connection.";
      statusEl.className="notice success";
    }else{
      statusEl.textContent="Network not recognized: browser reports that it is offline.";
      statusEl.className="notice error";
    }
  }

  updateNetworkStatus();
  window.addEventListener("online",updateNetworkStatus);
  window.addEventListener("offline",updateNetworkStatus);
  localStorage.setItem("brewHavenLastLaunch",now.toISOString());
}

document.addEventListener("DOMContentLoaded",setupNetworkTest);
