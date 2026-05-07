use wasm_bindgen::prelude::*;

/// Compute a simple moving average (SMA) with rolling-sum (O(n)) over `prices`.
///
/// - `window` must be >= 1.
/// - The first `window - 1` outputs are NaN, matching the JS reference implementation.
/// - The input is consumed as a `&[f64]` view (no per-element JS↔WASM crossing).
/// - The result is allocated once on the WASM heap and returned as a typed array.
#[wasm_bindgen]
pub fn sma_f64(prices: &[f64], window: usize) -> Vec<f64> {
    let n = prices.len();
    let mut out = vec![f64::NAN; n];
    if window == 0 || window > n {
        return out;
    }

    let w = window;
    let inv_w = 1.0_f64 / (w as f64);
    let mut sum: f64 = 0.0;

    // Prime the window.
    for i in 0..w {
        sum += prices[i];
    }
    out[w - 1] = sum * inv_w;

    // Rolling update.
    for i in w..n {
        sum += prices[i] - prices[i - w];
        out[i] = sum * inv_w;
    }

    out
}

/// Lightweight handshake / readiness check from JS.
#[wasm_bindgen]
pub fn ready() -> bool {
    true
}
