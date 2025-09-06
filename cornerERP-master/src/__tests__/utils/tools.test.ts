import { toCamelCase, toSnakeCase } from '@/utils/tools';

describe('Data Transformation Utils', () => {
	describe('toCamelCase', () => {
		it('should convert snake_case keys to camelCase', () => {
			const input = {
				user_name: 'John Doe',
				email_address: 'john@example.com',
				phone_number: '123-456-7890',
				start_of_duty: '2024-01-01'
			};

			const expected = {
				userName: 'John Doe',
				emailAddress: 'john@example.com',
				phoneNumber: '123-456-7890',
				startOfDuty: '2024-01-01'
			};

			const result = toCamelCase(input);
			expect(result).toEqual(expected);
		});

		it('should handle nested objects (current limitation)', () => {
			const input = {
				user_info: {
					first_name: 'John',
					last_name: 'Doe',
					contact_details: {
						email_address: 'john@example.com',
						phone_number: '123-456-7890'
					}
				}
			};

			// Current implementation only converts top-level keys
			const expected = {
				userInfo: {
					first_name: 'John',
					last_name: 'Doe',
					contact_details: {
						email_address: 'john@example.com',
						phone_number: '123-456-7890'
					}
				}
			};

			const result = toCamelCase(input);
			expect(result).toEqual(expected);
		});

		it('should handle arrays (current limitation)', () => {
			const input = {
				user_list: [
					{ user_name: 'John', email_address: 'john@example.com' },
					{ user_name: 'Jane', email_address: 'jane@example.com' }
				]
			};

			// Current implementation only converts top-level keys, not array items
			const expected = {
				userList: [
					{ user_name: 'John', email_address: 'john@example.com' },
					{ user_name: 'Jane', email_address: 'jane@example.com' }
				]
			};

			const result = toCamelCase(input);
			expect(result).toEqual(expected);
		});

		it('should handle null and undefined values', () => {
			const input = {
				user_name: null,
				email_address: undefined,
				phone_number: '123-456-7890'
			};

			const expected = {
				userName: null,
				emailAddress: undefined,
				phoneNumber: '123-456-7890'
			};

			const result = toCamelCase(input);
			expect(result).toEqual(expected);
		});
	});

	describe('toSnakeCase', () => {
		it('should convert camelCase keys to snake_case', () => {
			const input = {
				userName: 'John Doe',
				emailAddress: 'john@example.com',
				phoneNumber: '123-456-7890',
				startOfDuty: '2024-01-01'
			};

			const expected = {
				user_name: 'John Doe',
				email_address: 'john@example.com',
				phone_number: '123-456-7890',
				start_of_duty: '2024-01-01'
			};

			const result = toSnakeCase(input);
			expect(result).toEqual(expected);
		});

		it('should handle nested objects (current limitation)', () => {
			const input = {
				userInfo: {
					firstName: 'John',
					lastName: 'Doe',
					contactDetails: {
						emailAddress: 'john@example.com',
						phoneNumber: '123-456-7890'
					}
				}
			};

			// Current implementation only converts top-level keys
			const expected = {
				user_info: {
					firstName: 'John',
					lastName: 'Doe',
					contactDetails: {
						emailAddress: 'john@example.com',
						phoneNumber: '123-456-7890'
					}
				}
			};

			const result = toSnakeCase(input);
			expect(result).toEqual(expected);
		});

		it('should handle arrays (current limitation)', () => {
			const input = {
				userList: [
					{ userName: 'John', emailAddress: 'john@example.com' },
					{ userName: 'Jane', emailAddress: 'jane@example.com' }
				]
			};

			// Current implementation only converts top-level keys, not array items
			const expected = {
				user_list: [
					{ userName: 'John', emailAddress: 'john@example.com' },
					{ userName: 'Jane', emailAddress: 'jane@example.com' }
				]
			};

			const result = toSnakeCase(input);
			expect(result).toEqual(expected);
		});
	});

	describe('Round-trip conversion', () => {
		it('should maintain data integrity for top-level keys', () => {
			const original = {
				userName: 'John Doe',
				emailAddress: 'john@example.com',
				startDate: '2024-01-01'
			};

			// Convert to snake_case and back to camelCase
			const snakeCase = toSnakeCase(original);
			const backToCamelCase = toCamelCase(snakeCase);

			// Should work for top-level keys only
			expect(backToCamelCase).toEqual(original);
		});
	});
});
