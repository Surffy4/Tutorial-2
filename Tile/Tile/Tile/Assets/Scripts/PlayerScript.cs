using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class PlayerScript : MonoBehaviour 
{
    private Rigidbody2D rd2d;
    public float speed;
    public TextMeshProUGUI scoreText;
    public TextMeshProUGUI livesText;
    public GameObject winTextObject;
    public GameObject loseTextObject;
    public AudioSource winsound;

    private int score;
    private int lives;
    private bool facingRight = true;
    Animator anim;

    // Start is called before the first frame update
    void Start()
    {
        rd2d = GetComponent<Rigidbody2D>();
        anim = GetComponent<Animator>();
        lives = 3;
        SetScoreText();
        SetLivesText();
        winTextObject.SetActive(false);
        loseTextObject.SetActive(false);
        winsound.Stop();
    }
    
    void SetScoreText()
    {
        scoreText.text = "Score: " + score.ToString();
        if(score >= 4)
        {
            winTextObject.SetActive(true);
            winsound.Play();
        }
    }
    void SetLivesText()
    {
        livesText.text = "Lives: " + lives.ToString();
        if(lives <= 0)
        {
            loseTextObject.SetActive(true);
        }
    }

    // Update is called once per frame
    void FixedUpdate()
    {
        float hozMovement = Input.GetAxis("Horizontal");
        float verMovement = Input.GetAxis("Vertical");

        rd2d.AddForce(new Vector2(hozMovement * speed, verMovement));
        if (Input.GetKeyDown(KeyCode.D))
        {
            Flip();
            anim.SetInteger("State", 1);
        }
        if (Input.GetKeyUp(KeyCode.D))
        {
            anim.SetInteger("State", 0);
        }
        if (Input.GetKeyDown(KeyCode.A))
        {
            Flip();
            anim.SetInteger("State", 1);
        }
        if (Input.GetKeyUp(KeyCode.A))
        {
            anim.SetInteger("State", 0);
        }
        if (Input.GetKeyUp(KeyCode.W))
        {
            anim.SetInteger("State", 3);
        }
        if (Input.GetKeyDown(KeyCode.W))
        {
            anim.SetInteger("State", 0);
        }
    }

    void Flip()
    {
        Vector3 currentScale = gameObject.transform.localScale;
        currentScale.x *= -1;
        gameObject.transform.localScale = currentScale;
        facingRight = !facingRight;
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
       if (collision.collider.tag == "Coin")
        {
            score = score + 1;
            scoreText.text = "Score: " + score.ToString();
            Destroy(collision.collider.gameObject);
            SetScoreText();
            if (score ==8)
            {
                transform.position = new Vector2(41.5f,0.1f);
                lives = 3;
                livesText.text = "Lives: " + lives.ToString();
            }
        }
        if (collision.collider.tag == "Enemy")
        {
            lives = lives - 1;
            livesText.text = "Lives: " + lives.ToString();
            Destroy(collision.collider.gameObject);
            SetLivesText();
        }
        
    }
    private void OnCollisionStay2D (Collision2D collision)
    {
        if (collision.collider.tag == "Ground")
        {
            if (Input.GetKey(KeyCode.W))
            {
                rd2d.AddForce(new Vector2(0, 3), ForceMode2D.Impulse);
            }
        }
    }
}
