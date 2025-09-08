package testing;

import java.time.LocalDateTime;

public class Test {
	public static void main(String[] args) {
		LocalDateTime biddingDeadline = LocalDateTime.now().plusMinutes(2);
		System.out.println(biddingDeadline);
		
		LocalDateTime minCompletionDeadline = biddingDeadline.plusHours(24);
		System.out.println(minCompletionDeadline);

	}
}
