using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] float moveSpeed;
    [SerializeField] float rotationSpeed;
    [SerializeField] float speedBoostMultiplier;
    [SerializeField] GameObject cam;

    float camRotation;
    private void FixedUpdate()
    {
        Movement();
        Rotation();
    }

    void Movement()
    {
        // Move Player and Clamp Position in Bounds
        float speed = moveSpeed;
        if (Input.GetKey(KeyCode.LeftShift) || true) speed *= speedBoostMultiplier;
        transform.Translate(Input.GetAxis("Horizontal") * speed * Time.deltaTime, Input.GetAxis("UpDown") * speed * Time.deltaTime, Input.GetAxis("Vertical") * speed * Time.deltaTime);
        transform.position = new Vector3(transform.position.x, transform.position.y, transform.position.z);
    }

    private bool mouseDown = false;
    private Vector3 initialPosition;

    void Rotation()
    {
        if (Input.GetMouseButton(0)) {
            float xRotation = Input.GetAxisRaw("Mouse X") * rotationSpeed * Time.deltaTime;
            float zRotation = Input.GetAxisRaw("Mouse Y");
            transform.Rotate(new Vector3(0, xRotation, 0));

            camRotation += -zRotation * Time.deltaTime * rotationSpeed;
            camRotation = Mathf.Clamp(camRotation, -90, 90);

            cam.transform.rotation = Quaternion.Euler(camRotation, transform.rotation.eulerAngles.y, 0);
        }
    }
}
