/* eslint-disable no-unused-vars */
document.getElementById('editProductForm').addEventListener('change', (event) => {
  const elem = event.target
  console.log(elem)
  if (elem.id === 'productCostPrice') {
    changeCostPrice(elem.value)
  } else if (elem.id === 'productMarkup') {
    changeMarkup(elem.value)
  } else if (elem.id === 'productPriceIncTax') {
    changePriceIncTax(elem.value)
  } else if (elem.id === 'productTaxId') {
    changeTax(elem.value)
  }
})

const changeCostPrice = (costPrice) => {
  costPrice = parseFloat(costPrice)
  const markup = parseFloat(document.getElementById('productMarkup').value)
  const taxRate = parseFloat(document.getElementById('productTaxRate').value)
  console.log(markup)
  console.log(taxRate)
  const decimalMarkup = markup / 100
  if (taxRate == 0) {
    const newPriceExTax = costPrice + (costPrice * decimalMarkup)
    const newPriceIncTax = newPriceExTax
    console.log(newPriceExTax, newPriceIncTax)
    document.getElementById('productPriceExTax').value = newPriceExTax.toString()
    document.getElementById('productPriceIncTax').value = newPriceIncTax.toString()
  } else {
    const decimalTaxRate = taxRate / 100
    const newPriceExTax = costPrice + (costPrice * decimalMarkup)
    const newPriceIncTax = newPriceExTax + (newPriceExTax * decimalTaxRate)
    console.log(newPriceExTax, newPriceIncTax)

    document.getElementById('productPriceExTax').value = Number(newPriceExTax).toFixed(2).toString()
    document.getElementById('productPriceIncTax').value = Number(newPriceIncTax).toFixed(2).toString()
  }
}

const changeMarkup = (markup) => {
  markup = parseFloat(markup).toFixed(2)
  const costPrice = parseFloat(document.getElementById('productCostPrice').value)
  const taxRate = parseFloat(document.getElementById('productTaxRate').value)

  const decimalMarkup = markup / 100
  if (taxRate == 0) {
    const newPriceExTax = parseFloat(costPrice + (costPrice * decimalMarkup)).toFixed(2)
    const newPriceIncTax = newPriceExTax
    console.log(newPriceExTax, newPriceIncTax)
    document.getElementById('productPriceExTax').value = newPriceExTax.toString()
    document.getElementById('productPriceIncTax').value = newPriceIncTax.toString()
  } else {
    const decimalTaxRate = taxRate / 100
    const newPriceExTax = costPrice + (costPrice * decimalMarkup)
    const newPriceIncTax = newPriceExTax + (newPriceExTax * decimalTaxRate)
    document.getElementById('productPriceExTax').value = newPriceExTax.toString()
    document.getElementById('productPriceIncTax').value = newPriceIncTax.toString()
  }
}

const changePriceIncTax = (priceIncTax) => {
  priceIncTax = parseFloat(priceIncTax).toFixed(2)
  const markup = document.getElementById('productMarkup')
  const costPrice = parseFloat(document.getElementById('productCostPrice').value)
  const taxRate = parseFloat(document.getElementById('productTaxRate').value)

  if (taxRate == 0) {
    document.getElementById('productPriceExTax').value = priceIncTax.toString()
    const difference = priceIncTax - costPrice
    markup.value = parseFloat((difference * 100) / costPrice).toFixed(2).toString()
  } else {
    const markupIncTax = 100 + taxRate
    const markupExTax = 100
    const priceExTax = parseFloat((markupExTax * priceIncTax) / markupIncTax).toFixed(2)
    document.getElementById('productPriceExTax').value = priceExTax.toString()
    markup.value = parseFloat((((priceExTax - costPrice) * markupExTax) / costPrice)).toFixed(2).toString()
  }
}

const changeTax = (tax) => {
  console.log(tax)
  let { id, name, rate } = JSON.parse(tax)
  id = parseFloat(id)
  rate = parseFloat(rate)
  const productTaxName = document.getElementById('productTaxName')
  const productTaxRate = document.getElementById('productTaxRate')
  const productTaxId = document.getElementById('productTaxId')
  console.log(name)
  const priceExTax = parseFloat(document.getElementById('productPriceExTax').value)

  const decimalTax = rate / 100
  console.log(decimalTax, priceExTax)
  const newPriceIncTax = ((priceExTax * decimalTax) + priceExTax).toFixed(2)
  console.log(newPriceIncTax)
  // TODO: When set new value, the onchange event detects.
  document.getElementById('productPriceIncTax').value = newPriceIncTax.toString()
  // productTaxId.value = JSON.stringify(tax)
  productTaxName.value = name
  productTaxRate.value = rate.toString()
  // productTaxId.value = id
  // console.log(productTaxIdOption, productTaxId.value)
}

document.getElementById('editProductForm').addEventListener('submit', (event) => {
  const productTaxIdOption = document.getElementById('productTaxIdOption')
  const taxData = JSON.parse(productTaxIdOption.value)
  productTaxIdOption.value = taxData.id
  console.log(productTaxIdOption)
})
