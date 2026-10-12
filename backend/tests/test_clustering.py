import pytest
from app.services.clustering import cluster_scam_messages

def test_campaign_clustering():
    messages = [
        {
            "id": "1",
            "text": "Your account is temporarily suspended. Click here to verify your identity immediately: https://phish-login.top",
            "url": "https://phish-login.top"
        },
        {
            "id": "2",
            "text": "URGENT: Your account is suspended. Click here to verify your identity immediately: https://phish-login.top",
            "url": "https://phish-login.top"
        },
        {
            "id": "3",
            "text": "Completely unrelated inquiry about weather and meeting times for team sync.",
            "url": ""
        }
    ]
    res = cluster_scam_messages(messages, similarity_threshold=0.30)
    assert res.total_messages_analyzed == 3
    assert res.total_clusters_formed >= 1
    # Check that messages 1 and 2 grouped into cluster
    c = res.clusters[0]
    assert c.size == 2
    assert "https://phish-login.top" in c.shared_urls
    assert "POTENTIAL RELATIONSHIP" in c.relationship_disclaimer
