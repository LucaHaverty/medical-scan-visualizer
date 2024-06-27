using UnityEngine;

public class Point
{
    public Vector3Int arrayPos;
    public Vector3 worldPos;
    public float value;
    public Vector4 pointData;
    public float surfaceCutoff
    public bool inGround;

    public Point(Vector3Int arrayPos, Vector3 worldPos, float value, float surfaceCutoff, Vector4 pointData)
    {
        this.arrayPos = arrayPos;
        this.worldPos = worldPos;
        this.value = value;
        this.surfaceCutoff = surfaceCutoff;
        this.pointData = pointData;

        inGround = value < surfaceCutoff;
    }

    public void AddToValue(float addedValue)
    {
        value += addedValue;
        value = Mathf.Clamp01(value);
        pointData.w = value;
        inGround = value < surfaceCutoff;
    }

    public void SetValue(float newValue)
    {
        value = newValue;
        value = Mathf.Clamp01(value);
        inGround = value < surfaceCutoff;
    }
}