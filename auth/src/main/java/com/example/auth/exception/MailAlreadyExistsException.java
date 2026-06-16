package com.example.auth.exception;

public class MailAlreadyExistsException extends RuntimeException {

	public MailAlreadyExistsException(String message) {
		super(message);
	}
}
