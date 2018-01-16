/**
 *  Лабораторная работа №4
 *  Володин Сергей
 *  моделирование
 */

import * as readLine from 'readline-sync';

declare type InputNodeName = 'a' | 'b' | 'c' | 'd' ;
declare type NodeName = InputNodeName | 'f' | 'g' | 'h' | 'i' | 'j' | 'i' | 'k' | 'l' | 'm'| 'n'| 'z';

// константы
const INPUTS:NodeName[]   = ['a', 'b', 'c', 'd'];
const VALS: NodeName[]    = [...INPUTS, 'f', 'g', 'h', 'j', 'i', 'k', 'l', 'm', 'n', 'z'];
const AND:  number[][]  = [[0, 0, 0, 0, 0], [0, 1, 2, 3, 4], [0, 2, 2, 2, 2], [0, 3, 2, 3, 2], [0, 4, 2, 2, 4]];
const OR:   number[][]  = [[0, 1, 2, 3, 4], [1, 1, 1, 1, 1], [2, 1, 2, 2, 2], [3, 1, 2, 3, 2], [4, 1, 2, 2, 4]];
const NOT:  number[]    = [1, 0, 2, 4, 3];


const and: (...inputs) => number =
	(...inputs) => {
		if (inputs.some(x => x === void 0)) return void 0;
		return inputs.slice(1).reduce(((prev, cur) => AND[prev][cur]), inputs[0]);
	};

const notAnd: (...inputs) => number =
	(...inputs) => NOT[and(...inputs)];

const or: (...inputs) => number =
	(...inputs) => {
		if (inputs.some(x => x === void 0)) return void 0;
		return inputs.slice(1).reduce(((prev, cur) => OR[prev][cur]), inputs[0]);
	};

const notOr: (...inputs) => number =
	(...inputs) => NOT[or(...inputs)];

const repeat: (x: number) => number = x => x;

const SCHEME: {name: string, inputs: NodeName[], fun: Function}[] = [
	{
		name: 'f',
		inputs: ['a'],
		fun: repeat,
	},
	{
		name: 'g',
		inputs: ['b', 'c'],
		fun: and,
	},
	{
		name: 'h',
		inputs: ['g'],
		fun: repeat,
	},
	{
		name: 'i',
		inputs: ['g'],
		fun: repeat,
	},
	{
		name: 'j',
		inputs: ['g'],
		fun: repeat,
	},
	{
		name: 'k',
		inputs: ['f', 'h'],
		fun: or,
	},
	{
		name: 'l',
		inputs: ['j', 'd'],
		fun: notAnd,
	},
	{
		name: 'm',
		inputs: ['k', 'i'],
		fun: and
	},
	{
		name: 'n',
		inputs: ['i', 'l'],
		fun: or,
	},
	{
		name: 'z',
		inputs: ['m', 'n'],
		fun: or
	}
];


/**
 * Возвращает массив от 0 до N
 * @param {number} N крайний правый интервал
 * @returns {number[]}
 */
const getArrayFrom0ToN: (N: number) => number[] =
	N => Array.from(new Array(N),(_, index: number) => index);


/**
 * Расчёт схемы
 * @param {NodeName[]} vals имена узлов
 * @param scheme
 * @param {number[]} inputs входные данные
 * @param {NodeName} lastNode имя результата
 * @param staticValue
 * @returns {{[name: string]: number} результат
 */
const calculateScheme: (vals: NodeName[],
                        scheme: {name: string, inputs: NodeName[], fun: Function}[],
                        inputs: number[],
                        lastNode: NodeName,
                        staticValue: {[name: string]: number}) => number[] =
	(vals, scheme, inputs, lastNode, staticValue) => {
		let result: {[name: string]: number} = {};
		 vals.forEach((name, index) => result[name] = inputs[index] );

		 result = {...result, ...staticValue};
		while(result[lastNode] === void 0) {
			scheme.forEach((node: {name: string, inputs: NodeName[], fun: Function}) => {
				if (result[node.name] === void 0) {
					result[node.name] = node.fun(...node.inputs.map(input => result[input]));
				}
			})
		}

		return Object.keys(result)
			.sort((a, b) => a.localeCompare(b))
			.slice(inputs.length)
			.map(name => result[name]);
	};




//  Вывод
console.log('Входные данные: ');
console.log('a  b  c  d  z   f/0  f/1  g/0  g/1  h/0  h/1  j/0  j/1  i/0  i/1  k/0  k/1  l/0  l/1  m/0  m/1  n/0  n/1');
const errors: string[] = [];

let outString:string = getArrayFrom0ToN(16)
	.map(num => {
		const strAr = num.toString(2).split('');
		while (strAr.length !== 4) {
			strAr.push('0');
		}

		return strAr.reverse().map((element: string) => Number(element));
	})
	.map((inputValues: number[]) => {
		const result: number[][] = [calculateScheme(VALS, SCHEME, inputValues, 'z', {})];

		VALS.slice(inputValues.length, -1).forEach((nodeName, index) => {
			const lastidx = result[0].length - 1;

			let res = calculateScheme(VALS, SCHEME, inputValues, 'z', {[nodeName]: 0});

			if (res[lastidx] !== result[0][lastidx]) {
				errors.push(`На входе ${inputValues.join(' ')}: ошибка при ${nodeName} / 0`)
			}

			result.push(res);
			res = calculateScheme(VALS, SCHEME, inputValues, 'z', {[nodeName]: 1});

			if (res[lastidx] !== result[0][lastidx]) {
				errors.push(`На входе ${inputValues.join(' ')}: ошибка при ${nodeName} / 1`)
			}

			result.push(res);
		});

		return [inputValues, result.map(el => el[el.length - 1])];
	})
	.map(([inputValues, result]) =>
		`${inputValues.join('  ')}  ${result.join('    ')}`)
	.join('\n');

console.log(`${outString}\n${errors.join('\n')}`);


