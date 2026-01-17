package com.email.writer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.json.JsonParseException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;





@Service
public class EmailGeneratorService {
	
	private final WebClient webClient;
	private final String apiKey;

	public EmailGeneratorService(WebClient.Builder webClientBuilder,
			@Value("${gemini.api.url}") String baseUrl, 
			@Value("${gemini.api.key}") String geminiApiKey) {
		
		this.apiKey = geminiApiKey;
		this.webClient = webClientBuilder.baseUrl(baseUrl).build();
		
	}

	public String generateEmailReply(EmailRequest emailRequest) throws JsonMappingException, JsonProcessingException {
		// Build Prompt
		String prompt = buildPrompt(emailRequest);
		
		// Prepare raw json body
		String requestBody = String.format("""
				{
				    "contents": [
				      {
				        "parts": [
				          {
				            "text": "%s"
				          }
				        ]
				      }
				    ]
				}
				""",prompt);
		
		// Send request
		String response = webClient.post()
							.uri(uriBuilder ->uriBuilder
									.path("/v1beta/models/gemini-3-flash-preview:generateContent")
									.build())
									.header("x-goog-api-key", apiKey)
									.header("Content-Type", "application/json")
									.bodyValue(requestBody)
									.retrieve()
									.bodyToMono(String.class)
									.block();
		
		// Extract response from json
		 return extractResponseContent(response);
	}

	private String extractResponseContent(String response) throws JsonMappingException, JsonProcessingException {
		
		try {
			ObjectMapper mapper = new ObjectMapper();
			JsonNode root = mapper.readTree(response);
			return root.path("candidates")
			 .get(0)
			 .path("content")
			 .path("parts")
			 .get(0)
			 .path("text")
			 .asText();
			
		}catch(JsonProcessingException e) {
			throw new RuntimeException(e);
		}
		
		
	}

	private String buildPrompt(EmailRequest emailRequest) {
		StringBuilder prompt = new StringBuilder();
		prompt.append("Generate ONE clean, final email reply to the following email.\r\n"
				+ "\r\n"
				+ "Rules:\r\n"
				+ "- Do NOT give multiple options\r\n"
				+ "- Do NOT include headings, explanations, or tips\r\n"
				+ "- Do NOT use markdown\r\n"
				+ "- Return ONLY the email body\r\n"
				+ "- Keep the tone professional and concise ");
		if(emailRequest.getTone() !=null && !((String) emailRequest.getTone()).isEmpty()) {
			prompt.append("Use a ").append(emailRequest.getTone()).append(" tone ");
			
		}
		prompt.append("Original Email: \n").append(emailRequest.getEmailContent());
		return prompt.toString();
		
	}


}
