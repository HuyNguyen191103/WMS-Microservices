package com.example.auth.exception;

public class AuthUserNotFoundException extends RuntimeException {

	public AuthUserNotFoundException(String message) {
		super(message);
	}
}
