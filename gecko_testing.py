from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

# Read URLs from file
with open('phising_urls.txt', 'r') as file:
    urls = [url.strip() for url in file]

# Initialize the Firefox driver
driver = webdriver.Firefox()

# Variable to store the total score
total_score = 0

for url in urls:
    try:
        # Open the URL
        driver.get(url)

        # Wait for the page to load
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    except TimeoutException:
        # If the page does not load within the timeout, increment the total score
        total_score += 1

# Close the driver
driver.quit()

# Calculate the percentage
percentage = (total_score / len(urls)) * 100

# Print the percentage
print(f'Percentage of URLs that could not be loaded: {percentage}%')