import { useState, useCallback, useRef } from 'react'

const XOR_DATA = [
  { input: [0, 0], target: 0 },
  { input: [0, 1], target: 1 },
  { input: [1, 0], target: 1 },
  { input: [1, 1], target: 0 },
]

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z))
}

function sigmoidDerivative(z) {
  const s = sigmoid(z)
  return s * (1 - s)
}

function randomWeight() {
  // Xavier initialization for 2-input network
  return (Math.random() * 2 - 1) * Math.sqrt(2 / 2)
}

function initWeights() {
  return {
    weights1: [
      [randomWeight(), randomWeight(), randomWeight()],
      [randomWeight(), randomWeight(), randomWeight()],
    ],
    weights2: [[randomWeight()], [randomWeight()], [randomWeight()]],
    bias1: [randomWeight() * 0.1, randomWeight() * 0.1, randomWeight() * 0.1],
    bias2: [randomWeight() * 0.1],
  }
}

function computeForward(input, weights1, weights2, bias1, bias2) {
  const hiddenZ = [0, 0, 0]
  const hiddenA = [0, 0, 0]

  for (let j = 0; j < 3; j++) {
    hiddenZ[j] = input[0] * weights1[0][j] + input[1] * weights1[1][j] + bias1[j]
    hiddenA[j] = sigmoid(hiddenZ[j])
  }

  const outputZ = hiddenA[0] * weights2[0][0] + hiddenA[1] * weights2[1][0] + hiddenA[2] * weights2[2][0] + bias2[0]
  const outputA = sigmoid(outputZ)

  return { hiddenZ, hiddenA, outputZ, outputA }
}

function computeBackward(input, hiddenZ, hiddenA, outputZ, outputA, weights2, target) {
  const eps = 1e-7
  const loss = -(target * Math.log(outputA + eps) + (1 - target) * Math.log(1 - outputA + eps))

  // Output layer gradients
  const dL_dOutputA = -target / (outputA + eps) + (1 - target) / (1 - outputA + eps)
  const dL_dOutputZ = outputA - target // simplification for sigmoid + BCE

  // Layer 2 weight gradients
  const dL_dWeights2 = [
    dL_dOutputZ * hiddenA[0],
    dL_dOutputZ * hiddenA[1],
    dL_dOutputZ * hiddenA[2],
  ]
  const dL_dBias2 = [dL_dOutputZ]

  // Hidden layer activation gradients
  const dL_dHiddenA = [
    dL_dOutputZ * weights2[0][0],
    dL_dOutputZ * weights2[1][0],
    dL_dOutputZ * weights2[2][0],
  ]

  // Hidden pre-activation gradients (apply sigmoid derivative)
  const dL_dHiddenZ = [
    dL_dHiddenA[0] * sigmoidDerivative(hiddenZ[0]),
    dL_dHiddenA[1] * sigmoidDerivative(hiddenZ[1]),
    dL_dHiddenA[2] * sigmoidDerivative(hiddenZ[2]),
  ]

  // Layer 1 weight gradients
  const dL_dWeights1 = [
    [dL_dHiddenZ[0] * input[0], dL_dHiddenZ[1] * input[0], dL_dHiddenZ[2] * input[0]],
    [dL_dHiddenZ[0] * input[1], dL_dHiddenZ[1] * input[1], dL_dHiddenZ[2] * input[1]],
  ]
  const dL_dBias1 = [dL_dHiddenZ[0], dL_dHiddenZ[1], dL_dHiddenZ[2]]

  return {
    loss,
    dL_dOutputA,
    dL_dOutputZ,
    dL_dWeights2,
    dL_dBias2,
    dL_dHiddenA,
    dL_dHiddenZ,
    dL_dWeights1,
    dL_dBias1,
  }
}

function computeFullState(weights1, weights2, bias1, bias2, inputIndex) {
  const { input, target } = XOR_DATA[inputIndex]
  const { hiddenZ, hiddenA, outputZ, outputA } = computeForward(input, weights1, weights2, bias1, bias2)
  const backward = computeBackward(input, hiddenZ, hiddenA, outputZ, outputA, weights2, target)
  return {
    weights1,
    weights2,
    bias1,
    bias2,
    input,
    target,
    hiddenZ,
    hiddenA,
    outputZ,
    outputA,
    ...backward,
  }
}

export function useNeuralNet() {
  const [inputIndex, setInputIndexState] = useState(1)
  const [lossHistory, setLossHistory] = useState([])
  const stepCountRef = useRef(0)

  // Optimizer state (momentum/Adam)
  const optimizerStateRef = useRef({
    // SGD+Momentum
    vWeights1: [[0,0,0],[0,0,0]],
    vWeights2: [[0],[0],[0]],
    vBias1: [0,0,0],
    vBias2: [0],
    // Adam
    mWeights1: [[0,0,0],[0,0,0]],
    mWeights2: [[0],[0],[0]],
    mBias1: [0,0,0],
    mBias2: [0],
    vvWeights1: [[0,0,0],[0,0,0]],
    vvWeights2: [[0],[0],[0]],
    vvBias1: [0,0,0],
    vvBias2: [0],
    t: 0,
  })

  const initW = initWeights()
  const [netState, setNetState] = useState(() => {
    return computeFullState(initW.weights1, initW.weights2, initW.bias1, initW.bias2, 1)
  })

  const updateState = useCallback((weights1, weights2, bias1, bias2, idx) => {
    const newState = computeFullState(weights1, weights2, bias1, bias2, idx)
    setNetState(newState)
    return newState
  }, [])

  const setWeights1 = useCallback((i, j, value) => {
    setNetState(prev => {
      const w1 = prev.weights1.map(row => [...row])
      w1[i][j] = value
      return computeFullState(w1, prev.weights2, prev.bias1, prev.bias2, inputIndex)
    })
  }, [inputIndex])

  const setWeights2 = useCallback((j, value) => {
    setNetState(prev => {
      const w2 = prev.weights2.map(row => [...row])
      w2[j][0] = value
      return computeFullState(prev.weights1, w2, prev.bias1, prev.bias2, inputIndex)
    })
  }, [inputIndex])

  const setBias1 = useCallback((j, value) => {
    setNetState(prev => {
      const b1 = [...prev.bias1]
      b1[j] = value
      return computeFullState(prev.weights1, prev.weights2, b1, prev.bias2, inputIndex)
    })
  }, [inputIndex])

  const setBias2 = useCallback((value) => {
    setNetState(prev => {
      const b2 = [...prev.bias2]
      b2[0] = value
      return computeFullState(prev.weights1, prev.weights2, prev.bias1, b2, inputIndex)
    })
  }, [inputIndex])

  const setInput = useCallback((index) => {
    setInputIndexState(index)
    setNetState(prev => computeFullState(prev.weights1, prev.weights2, prev.bias1, prev.bias2, index))
  }, [])

  const step = useCallback((optimizer = 'sgd', lr = 0.1) => {
    setNetState(prev => {
      const {
        weights1, weights2, bias1, bias2,
        dL_dWeights1, dL_dWeights2, dL_dBias1, dL_dBias2,
        loss
      } = prev

      stepCountRef.current += 1
      const t = stepCountRef.current
      const os = optimizerStateRef.current

      let newW1 = weights1.map(row => [...row])
      let newW2 = weights2.map(row => [...row])
      let newB1 = [...bias1]
      let newB2 = [...bias2]

      if (optimizer === 'sgd') {
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 3; j++)
            newW1[i][j] -= lr * dL_dWeights1[i][j]
        for (let j = 0; j < 3; j++)
          newW2[j][0] -= lr * dL_dWeights2[j]
        for (let j = 0; j < 3; j++)
          newB1[j] -= lr * dL_dBias1[j]
        newB2[0] -= lr * dL_dBias2[0]

      } else if (optimizer === 'momentum') {
        const beta = 0.9
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 3; j++) {
            os.vWeights1[i][j] = beta * os.vWeights1[i][j] + (1 - beta) * dL_dWeights1[i][j]
            newW1[i][j] -= lr * os.vWeights1[i][j]
          }
        for (let j = 0; j < 3; j++) {
          os.vWeights2[j][0] = beta * os.vWeights2[j][0] + (1 - beta) * dL_dWeights2[j]
          newW2[j][0] -= lr * os.vWeights2[j][0]
        }
        for (let j = 0; j < 3; j++) {
          os.vBias1[j] = beta * os.vBias1[j] + (1 - beta) * dL_dBias1[j]
          newB1[j] -= lr * os.vBias1[j]
        }
        os.vBias2[0] = beta * os.vBias2[0] + (1 - beta) * dL_dBias2[0]
        newB2[0] -= lr * os.vBias2[0]

      } else if (optimizer === 'adam') {
        const beta1 = 0.9, beta2 = 0.999, eps = 1e-8
        os.t = t

        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 3; j++) {
            const g = dL_dWeights1[i][j]
            os.mWeights1[i][j] = beta1 * os.mWeights1[i][j] + (1 - beta1) * g
            os.vvWeights1[i][j] = beta2 * os.vvWeights1[i][j] + (1 - beta2) * g * g
            const mHat = os.mWeights1[i][j] / (1 - Math.pow(beta1, t))
            const vHat = os.vvWeights1[i][j] / (1 - Math.pow(beta2, t))
            newW1[i][j] -= lr * mHat / (Math.sqrt(vHat) + eps)
          }
        for (let j = 0; j < 3; j++) {
          const g = dL_dWeights2[j]
          os.mWeights2[j][0] = beta1 * os.mWeights2[j][0] + (1 - beta1) * g
          os.vvWeights2[j][0] = beta2 * os.vvWeights2[j][0] + (1 - beta2) * g * g
          const mHat = os.mWeights2[j][0] / (1 - Math.pow(beta1, t))
          const vHat = os.vvWeights2[j][0] / (1 - Math.pow(beta2, t))
          newW2[j][0] -= lr * mHat / (Math.sqrt(vHat) + eps)
        }
        for (let j = 0; j < 3; j++) {
          const g = dL_dBias1[j]
          os.mBias1[j] = beta1 * os.mBias1[j] + (1 - beta1) * g
          os.vvBias1[j] = beta2 * os.vvBias1[j] + (1 - beta2) * g * g
          const mHat = os.mBias1[j] / (1 - Math.pow(beta1, t))
          const vHat = os.vvBias1[j] / (1 - Math.pow(beta2, t))
          newB1[j] -= lr * mHat / (Math.sqrt(vHat) + eps)
        }
        const g2 = dL_dBias2[0]
        os.mBias2[0] = beta1 * os.mBias2[0] + (1 - beta1) * g2
        os.vvBias2[0] = beta2 * os.vvBias2[0] + (1 - beta2) * g2 * g2
        const mHat2 = os.mBias2[0] / (1 - Math.pow(beta1, t))
        const vHat2 = os.vvBias2[0] / (1 - Math.pow(beta2, t))
        newB2[0] -= lr * mHat2 / (Math.sqrt(vHat2) + eps)
      }

      const newState = computeFullState(newW1, newW2, newB1, newB2, inputIndex)

      setLossHistory(h => {
        const next = [...h, { step: t, loss: newState.loss }]
        return next.slice(-100)
      })

      return newState
    })
  }, [inputIndex])

  const train = useCallback((steps, optimizer, lr) => {
    // Run multiple steps sequentially using functional updates
    for (let k = 0; k < steps; k++) {
      step(optimizer, lr)
    }
  }, [step])

  const reset = useCallback(() => {
    stepCountRef.current = 0
    optimizerStateRef.current = {
      vWeights1: [[0,0,0],[0,0,0]],
      vWeights2: [[0],[0],[0]],
      vBias1: [0,0,0],
      vBias2: [0],
      mWeights1: [[0,0,0],[0,0,0]],
      mWeights2: [[0],[0],[0]],
      mBias1: [0,0,0],
      mBias2: [0],
      vvWeights1: [[0,0,0],[0,0,0]],
      vvWeights2: [[0],[0],[0]],
      vvBias1: [0,0,0],
      vvBias2: [0],
      t: 0,
    }
    setLossHistory([])
    const w = initWeights()
    setNetState(computeFullState(w.weights1, w.weights2, w.bias1, w.bias2, inputIndex))
  }, [inputIndex])

  return {
    state: netState,
    inputIndex,
    lossHistory,
    setWeights1,
    setWeights2,
    setBias1,
    setBias2,
    setInput,
    step,
    train,
    reset,
    XOR_DATA,
  }
}
