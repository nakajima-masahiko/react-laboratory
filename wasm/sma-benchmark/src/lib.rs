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

/// Number of contiguous output series produced by `multi_indicators_f64`.
/// Order:
///   0: SMA  5
///   1: SMA  25
///   2: SMA  75
///   3: SMA  200
///   4: EMA  5
///   5: EMA  25
///   6: EMA  75
///   7: RSI  14
///   8: Bollinger 20 middle
///   9: Bollinger 20 upper (+2σ)
///  10: Bollinger 20 lower (-2σ)
///  11: rolling min 100
///  12: rolling max 100
pub const NUM_SERIES: usize = 13;

#[wasm_bindgen]
pub fn num_indicator_series() -> usize {
    NUM_SERIES
}

fn fill_sma(prices: &[f64], window: usize, out: &mut [f64]) {
    let n = prices.len();
    if window == 0 || window > n {
        return;
    }
    let inv_w = 1.0_f64 / (window as f64);
    let mut sum = 0.0_f64;
    for i in 0..window {
        sum += prices[i];
    }
    out[window - 1] = sum * inv_w;
    for i in window..n {
        sum += prices[i] - prices[i - window];
        out[i] = sum * inv_w;
    }
}

/// EMA seeded with the SMA of the first `window` prices, matching the JS
/// reference implementation. Indices < window-1 stay NaN.
fn fill_ema(prices: &[f64], window: usize, out: &mut [f64]) {
    let n = prices.len();
    if window == 0 || window > n {
        return;
    }
    let alpha = 2.0_f64 / (window as f64 + 1.0_f64);
    let one_minus_alpha = 1.0_f64 - alpha;
    let mut seed = 0.0_f64;
    for i in 0..window {
        seed += prices[i];
    }
    seed /= window as f64;
    out[window - 1] = seed;
    let mut prev = seed;
    for i in window..n {
        let cur = alpha * prices[i] + one_minus_alpha * prev;
        out[i] = cur;
        prev = cur;
    }
}

/// Wilder's RSI. Outputs NaN for indices 0..=period-1.
fn fill_rsi(prices: &[f64], period: usize, out: &mut [f64]) {
    let n = prices.len();
    if period == 0 || n <= period {
        return;
    }
    let p = period as f64;
    let mut sum_gain = 0.0_f64;
    let mut sum_loss = 0.0_f64;
    for i in 1..=period {
        let diff = prices[i] - prices[i - 1];
        if diff > 0.0 {
            sum_gain += diff;
        } else if diff < 0.0 {
            sum_loss += -diff;
        }
    }
    let mut avg_gain = sum_gain / p;
    let mut avg_loss = sum_loss / p;
    out[period] = if avg_loss == 0.0 {
        100.0
    } else {
        let rs = avg_gain / avg_loss;
        100.0 - 100.0 / (1.0 + rs)
    };
    let inv_p = 1.0_f64 / p;
    let p_minus_1 = p - 1.0;
    for i in (period + 1)..n {
        let diff = prices[i] - prices[i - 1];
        let gain = if diff > 0.0 { diff } else { 0.0 };
        let loss = if diff < 0.0 { -diff } else { 0.0 };
        avg_gain = (avg_gain * p_minus_1 + gain) * inv_p;
        avg_loss = (avg_loss * p_minus_1 + loss) * inv_p;
        out[i] = if avg_loss == 0.0 {
            100.0
        } else {
            let rs = avg_gain / avg_loss;
            100.0 - 100.0 / (1.0 + rs)
        };
    }
}

/// Bollinger Bands using rolling sum + rolling sum-of-squares for population
/// variance. Numerically guards against tiny negative variance from
/// catastrophic cancellation.
fn fill_bollinger(
    prices: &[f64],
    window: usize,
    out_mid: &mut [f64],
    out_up: &mut [f64],
    out_low: &mut [f64],
) {
    let n = prices.len();
    if window == 0 || window > n {
        return;
    }
    let w = window as f64;
    let inv_w = 1.0_f64 / w;
    let mut sum = 0.0_f64;
    let mut sum_sq = 0.0_f64;
    for i in 0..window {
        sum += prices[i];
        sum_sq += prices[i] * prices[i];
    }
    let mean = sum * inv_w;
    let mut variance = sum_sq * inv_w - mean * mean;
    if variance < 0.0 {
        variance = 0.0;
    }
    let std = variance.sqrt();
    out_mid[window - 1] = mean;
    out_up[window - 1] = mean + 2.0 * std;
    out_low[window - 1] = mean - 2.0 * std;
    for i in window..n {
        let in_v = prices[i];
        let out_v = prices[i - window];
        sum += in_v - out_v;
        sum_sq += in_v * in_v - out_v * out_v;
        let mean = sum * inv_w;
        let mut variance = sum_sq * inv_w - mean * mean;
        if variance < 0.0 {
            variance = 0.0;
        }
        let std = variance.sqrt();
        out_mid[i] = mean;
        out_up[i] = mean + 2.0 * std;
        out_low[i] = mean - 2.0 * std;
    }
}

/// Rolling min and max in O(n) using monotonic deques over a fixed `window`.
/// Outputs NaN for indices < window-1. Indices in the deque are stored in a
/// `Vec<usize>` with a head cursor instead of `VecDeque` to keep the inner
/// loop branchless and allocation-free after the first reserve.
fn fill_min_max(prices: &[f64], window: usize, out_min: &mut [f64], out_max: &mut [f64]) {
    let n = prices.len();
    if window == 0 || window > n {
        return;
    }
    let mut min_buf: Vec<usize> = Vec::with_capacity(window);
    let mut max_buf: Vec<usize> = Vec::with_capacity(window);
    let mut min_head: usize = 0;
    let mut max_head: usize = 0;

    for i in 0..n {
        let v = prices[i];

        while min_buf.len() > min_head {
            let back = *min_buf.last().unwrap();
            if prices[back] >= v {
                min_buf.pop();
            } else {
                break;
            }
        }
        min_buf.push(i);
        if min_buf[min_head] + window <= i {
            min_head += 1;
        }

        while max_buf.len() > max_head {
            let back = *max_buf.last().unwrap();
            if prices[back] <= v {
                max_buf.pop();
            } else {
                break;
            }
        }
        max_buf.push(i);
        if max_buf[max_head] + window <= i {
            max_head += 1;
        }

        if i + 1 >= window {
            out_min[i] = prices[min_buf[min_head]];
            out_max[i] = prices[max_buf[max_head]];
        }
    }
}

/// Compute 13 indicator series for the same `prices` array in a single
/// JS↔WASM crossing. Returns a flat `Vec<f64>` of length `prices.len() *
/// NUM_SERIES`; the JS side splits it into 13 typed-array subviews.
///
/// The series order matches the `NUM_SERIES` doc above. Each block has length
/// `prices.len()` so callers can compute `series_k = out[k*n .. (k+1)*n]`.
#[wasm_bindgen]
pub fn multi_indicators_f64(prices: &[f64]) -> Vec<f64> {
    let n = prices.len();
    let mut out = vec![f64::NAN; n * NUM_SERIES];
    if n == 0 {
        return out;
    }

    let (sma5, rest) = out.split_at_mut(n);
    let (sma25, rest) = rest.split_at_mut(n);
    let (sma75, rest) = rest.split_at_mut(n);
    let (sma200, rest) = rest.split_at_mut(n);
    let (ema5, rest) = rest.split_at_mut(n);
    let (ema25, rest) = rest.split_at_mut(n);
    let (ema75, rest) = rest.split_at_mut(n);
    let (rsi, rest) = rest.split_at_mut(n);
    let (bb_mid, rest) = rest.split_at_mut(n);
    let (bb_up, rest) = rest.split_at_mut(n);
    let (bb_low, rest) = rest.split_at_mut(n);
    let (min100, rest) = rest.split_at_mut(n);
    let (max100, _) = rest.split_at_mut(n);

    fill_sma(prices, 5, sma5);
    fill_sma(prices, 25, sma25);
    fill_sma(prices, 75, sma75);
    fill_sma(prices, 200, sma200);

    fill_ema(prices, 5, ema5);
    fill_ema(prices, 25, ema25);
    fill_ema(prices, 75, ema75);

    fill_rsi(prices, 14, rsi);

    fill_bollinger(prices, 20, bb_mid, bb_up, bb_low);

    fill_min_max(prices, 100, min100, max100);

    out
}

/// Boundary-cost probe: same input / same output size as
/// `multi_indicators_f64`, but performs no computation. Subtracting its time
/// from the real call approximates pure compute time.
#[wasm_bindgen]
pub fn multi_indicators_overhead_f64(prices: &[f64]) -> Vec<f64> {
    let n = prices.len();
    vec![f64::NAN; n * NUM_SERIES]
}

/// Lightweight handshake / readiness check from JS.
#[wasm_bindgen]
pub fn ready() -> bool {
    true
}
