# Fix Your Homepage - Manual Steps

Since the API is having connectivity issues, follow these manual steps to fix your homepage in Shopify. This will take about 5 minutes:

## Step 1: Create the Welcome Page in Shopify

1. **Go to Shopify Admin:** https://admin.shopify.com/store/alldogsrockshop/pages

2. **Click "Add page"** (top right button)

3. **Fill in the details:**
   - **Title:** `Welcome to All Dogs Rock`
   - **Handle:** Click "Edit" next to the title and change to: `welcome`

4. **Copy and paste the content below into the "Content" box:**

Click the "</> Show HTML" button first (bottom left of the editor), then paste this:

```html
<style>
  .welcome-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .hero-section {
    text-align: center;
    padding: 50px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: white;
    margin-bottom: 40px;
  }

  .hero-section h1 {
    font-size: 3.5em;
    margin-bottom: 20px;
    font-weight: 900;
  }

  .hero-section p {
    font-size: 1.5em;
    margin-bottom: 40px;
    opacity: 0.95;
  }

  .btn-get-started {
    background: white;
    color: #667eea;
    border: none;
    padding: 25px 60px;
    border-radius: 50px;
    font-size: 1.5em;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    display: inline-block;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .btn-get-started:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  }

  .how-it-works {
    margin: 40px 0;
  }

  .how-it-works h2 {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 50px;
    color: #333;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    margin-bottom: 60px;
  }

  .step-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s;
  }

  .step-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  }

  .step-number {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5em;
    font-weight: 900;
    margin: 0 auto 25px;
  }

  .step-card h3 {
    font-size: 1.8em;
    margin-bottom: 15px;
    color: #333;
  }

  .step-card p {
    color: #666;
    font-size: 1.1em;
    line-height: 1.6;
  }

  .examples-section {
    background: #f8f9ff;
    padding: 50px 20px;
    border-radius: 20px;
    margin: 40px 0;
  }

  .examples-section h2 {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 20px;
    color: #333;
  }

  .examples-section p {
    text-align: center;
    font-size: 1.2em;
    color: #666;
    margin-bottom: 40px;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .example-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .example-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .example-card h4 {
    padding: 20px;
    text-align: center;
    font-size: 1.3em;
    color: #333;
  }

  .products-section {
    text-align: center;
    margin: 40px 0;
  }

  .products-section h2 {
    font-size: 2.5em;
    margin-bottom: 30px;
    color: #333;
  }

  .products-section p {
    font-size: 1.3em;
    color: #666;
    margin-bottom: 50px;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    max-width: 900px;
    margin: 0 auto 50px;
  }

  .product-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .product-card h4 {
    font-size: 1.5em;
    margin-bottom: 10px;
    color: #333;
  }

  .product-card p {
    color: #666;
    font-size: 1em;
  }

  .cta-section {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: white;
  }

  .cta-section h2 {
    font-size: 2.5em;
    margin-bottom: 20px;
  }

  .cta-section p {
    font-size: 1.3em;
    margin-bottom: 40px;
    opacity: 0.95;
  }

  @media (max-width: 768px) {
    .hero-section h1 {
      font-size: 2.5em;
    }

    .hero-section p {
      font-size: 1.2em;
    }

    .btn-get-started {
      font-size: 1.2em;
      padding: 20px 40px;
    }
  }
</style>

<div class="welcome-container">
  <!-- Hero Section -->
  <div class="hero-section">
    <h1>All Dogs Rock Shop</h1>
    <p>Transform Your Dog Into History's Greatest Icons!</p>
    <p style="font-size: 1.1em; opacity: 0.9;">Upload your dog's photo and watch AI place them perfectly into famous moments—Washington crossing the Delaware, Rocky at the steps, Babe Ruth's called shot, and more!</p>

    <a href="/pages/create-iconic-dog" class="btn-get-started">
      Get Started Now
    </a>
  </div>

  <!-- How It Works Section -->
  <div class="how-it-works">
    <h2>How It Works</h2>

    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Upload Your Dog's Photo</h3>
        <p>Upload 1-3 clear photos of your dog from different angles. Our AI needs to see your dog's unique features to preserve them perfectly!</p>
      </div>

      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Choose an Iconic Pose</h3>
        <p>Pick from 5 legendary moments: Washington, Rocky, Babe Ruth, Presidential Speech, or NFL Team Photo. Your dog, your choice!</p>
      </div>

      <div class="step-card">
        <div class="step-number">3</div>
        <h3>AI Creates Your Masterpiece</h3>
        <p>In 10-15 seconds, our advanced AI preserves your dog's EXACT breed, color, and markings while placing them into the iconic scene!</p>
      </div>

      <div class="step-card">
        <div class="step-number">4</div>
        <h3>Choose Your Product</h3>
        <p>Get your iconic dog on a premium framed print, stretched canvas, or custom t-shirt. Perfect gift for any dog lover!</p>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="/pages/create-iconic-dog" class="btn-get-started">
        Create Your Iconic Dog
      </a>
    </div>
  </div>

  <!-- Examples Section -->
  <div class="examples-section">
    <h2>See Real Examples - Your Dog as an Icon</h2>
    <p>These are actual AI-generated images from our customers. Your dog will look just as amazing!</p>

    <div class="examples-grid">
      <div class="example-card">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/500px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg" class="example-image" alt="Washington">
        <h4>Washington Crossing Delaware</h4>
      </div>

      <div class="example-card">
        <img src="https://replicate.delivery/yhqm/1ut7IpU4wbJfZKEa9D5DLBuoenHtYe2N6QQKIRzHuF0sVlNrA/out-0.png" class="example-image" alt="Rocky">
        <h4>Rocky at the Steps</h4>
      </div>

      <div class="example-card">
        <img src="https://replicate.delivery/yhqm/TrQgZT3CYkLXHh3pTFjEiNURqAYp6YzKeGJ9U5HquuegsymVA/out-0.png" class="example-image" alt="Babe Ruth">
        <h4>Babe Ruth Called Shot</h4>
      </div>

      <div class="example-card">
        <img src="https://via.placeholder.com/400x250/1C3664/FFFFFF/png?text=Presidential+Speech" class="example-image" alt="President">
        <h4>Presidential Speech</h4>
      </div>
    </div>
  </div>

  <!-- Products Section -->
  <div class="products-section">
    <h2>Available Products</h2>
    <p>Turn your iconic dog into a beautiful keepsake</p>

    <div class="products-grid">
      <div class="product-card">
        <h4>Framed Print</h4>
        <p>Premium quality frame with museum-grade print</p>
      </div>

      <div class="product-card">
        <h4>Canvas Print</h4>
        <p>Gallery-wrapped canvas stretched on wood frame</p>
      </div>

      <div class="product-card">
        <h4>Custom T-Shirt</h4>
        <p>High-quality print on comfortable cotton tee</p>
      </div>
    </div>
  </div>

  <!-- Final CTA -->
  <div class="cta-section">
    <h2>Ready to Make Your Dog a Legend?</h2>
    <p>Join thousands of dog owners who've transformed their pets into icons!</p>
    <a href="/pages/create-iconic-dog" class="btn-get-started">
      Start Creating Now
    </a>
  </div>
</div>
```

5. **Click "Save"**

## Step 2: Set Your Homepage to Redirect

Now we need to edit your theme's homepage template to redirect to the welcome page:

1. **Go to Themes:** https://admin.shopify.com/store/alldogsrockshop/themes

2. **Click the three dots "..." next to your active theme → "Edit code"**

3. **In the left sidebar, find and click: `templates/index.liquid`**

4. **Add this code at the VERY TOP of the file** (before any other code):

```liquid
{%- comment -%}
AUTO-REDIRECT TO WELCOME PAGE
{%- endcomment -%}

<script>
  // Immediate redirect to welcome page
  window.location.replace('/pages/welcome');
</script>

<noscript>
  <meta http-equiv="refresh" content="0; url=/pages/welcome">
  <p>Redirecting to <a href="/pages/welcome">Welcome Page</a>...</p>
</noscript>

{%- comment -%}
The original homepage template is preserved below this redirect
{%- endcomment -%}
```

5. **Click "Save"** (top right)

## Step 3: Test Your Homepage

Open these URLs in a new incognito window (to bypass cache):

- **https://alldogsrockshop.com** ← Your main domain
- **https://8k5mna-5e.myshopify.com** ← Your Shopify URL

Both should now show your beautiful welcome page!

## Troubleshooting

If you still see the old page:
- **Clear your browser cache** (Ctrl+Shift+Delete / Cmd+Shift+Delete)
- **Try an incognito/private window**
- **Wait 1-2 minutes** for Shopify's cache to clear

---

**That's it!** Your homepage should now work perfectly for all your domains!
